import QRCode from "qrcode";
import { Referral } from "../models/referral.models.js";
import { Record } from "../models/record.models.js";
import { getIo } from "../socket/io.store.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const STATUS_TRANSITIONS = {
  issued: { next: "traveling", label: "Start Journey (In-Transit)", action: "Travelling" },
  traveling: { next: "arrived", label: "Admit at Facility", action: "Admitted" },
  arrived: { next: "seen", label: "Discharge Patient", action: "Discharged" },
};

/**
 * Generate QR code for a referral ticket
 * GET /api/qr/:referralId
 */
export const generateQrCode = asyncHandler(async (req, res) => {
  const { referralId } = req.params;

  const referral = await Referral.findById(referralId)
    .populate("patient", "name abhaId age gender village phone")
    .populate("fromFacility", "name tier location")
    .populate("toFacility", "name tier location contactPhone");

  if (!referral) {
    throw new ApiError(404, "Referral ticket not found.");
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const scanUrl = `${frontendUrl}/scan/${referral._id}`;

  const qrDataUrl = await QRCode.toDataURL(scanUrl, {
    width: 320,
    margin: 2,
    color: {
      dark: "#134e4a",
      light: "#ffffff",
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        qrDataUrl,
        scanUrl,
        referralId: referral._id,
        referralCode: referral.referralCode,
        patientName: referral.patient?.name,
        currentStatus: referral.status,
      },
      "QR code generated successfully"
    )
  );
});

/**
 * Public status lookup for scan page
 * GET /api/qr/scan-status/:referralId
 */
export const getReferralScanStatus = asyncHandler(async (req, res) => {
  const { referralId } = req.params;

  let referral;
  if (referralId.match(/^[0-9a-fA-F]{24}$/)) {
    referral = await Referral.findById(referralId)
      .populate("patient", "name abhaId age gender village phone conditions riskTier")
      .populate("fromFacility", "name tier location contactPhone")
      .populate("toFacility", "name tier location contactPhone inChargeDoctor")
      .populate("issuedBy", "name role qualifications phone");
  } else {
    referral = await Referral.findOne({ referralCode: referralId })
      .populate("patient", "name abhaId age gender village phone conditions riskTier")
      .populate("fromFacility", "name tier location contactPhone")
      .populate("toFacility", "name tier location contactPhone inChargeDoctor")
      .populate("issuedBy", "name role qualifications phone");
  }

  if (!referral) {
    throw new ApiError(404, "Referral record not found.");
  }

  const transition = STATUS_TRANSITIONS[referral.status] || null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        referral,
        nextStatus: transition?.next || null,
        nextLabel: transition?.label || null,
        actionName: transition?.action || null,
        isCompleted: referral.status === "seen" || referral.status === "closed",
      },
      "Referral scan details fetched"
    )
  );
});

/**
 * Public QR scan trigger - transitions status to next stage
 * POST /api/qr/scan/:referralId
 */
export const scanAndAdvanceStatus = asyncHandler(async (req, res) => {
  const { referralId } = req.params;
  const { scannerRole, scannedBy, scannerLocation, customNote } = req.body || {};

  let referral;
  if (referralId.match(/^[0-9a-fA-F]{24}$/)) {
    referral = await Referral.findById(referralId)
      .populate("patient", "name abhaId age gender village phone conditions riskTier")
      .populate("fromFacility", "name tier location")
      .populate("toFacility", "name tier location contactPhone inChargeDoctor");
  } else {
    referral = await Referral.findOne({ referralCode: referralId })
      .populate("patient", "name abhaId age gender village phone conditions riskTier")
      .populate("fromFacility", "name tier location")
      .populate("toFacility", "name tier location contactPhone inChargeDoctor");
  }

  if (!referral) {
    throw new ApiError(404, "Referral record not found.");
  }

  const currentStatus = referral.status;
  const transition = STATUS_TRANSITIONS[currentStatus];

  if (!transition) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          referral,
          alreadyCompleted: true,
          message: `Referral is already at final milestone: ${currentStatus.toUpperCase()} (Discharged / Feedback Closed).`,
        },
        "No further transition needed"
      )
    );
  }

  const nextStatus = transition.next;
  referral.status = nextStatus;

  let note = customNote;
  if (!note) {
    if (nextStatus === "traveling") {
      note = `QR checkpoint scanned: Patient departure confirmed. Transport en-route to ${referral.toFacility?.name || "facility"}.`;
    } else if (nextStatus === "arrived") {
      note = `QR checkpoint scanned: Patient admitted & registered at triage/intake desk at ${referral.toFacility?.name || "facility"}.`;
    } else if (nextStatus === "seen") {
      note = `QR checkpoint scanned: Patient consultation and care completed. Discharged with feedback loop closed.`;
    }
  }

  if (nextStatus === "arrived") {
    referral.actualArrivalTime = new Date();
  } else if (nextStatus === "seen" || nextStatus === "closed") {
    referral.seenTime = new Date();
    referral.feedbackClosedLoop = true;
    referral.referringAshaNotified = true;
  }

  referral.statusHistory.push({
    status: nextStatus,
    timestamp: new Date(),
    updatedByName: scannedBy || scannerRole || "QR Checkpoint Scanner",
    note: note || `Status progressed to ${nextStatus} via QR Scan`,
  });

  await referral.save();

  // Create longitudinal medical record update
  try {
    await Record.create({
      patient: referral.patient._id,
      facility: nextStatus === "arrived" ? referral.toFacility?._id : referral.fromFacility?._id,
      type: "referral",
      title: `QR Scan Checkpoint: ${transition.action.toUpperCase()} (${nextStatus.toUpperCase()})`,
      subtitle: `Referral ID: ${referral.referralCode}`,
      summary: `${referral.patient?.name} is now marked as ${transition.action.toLowerCase()} (${nextStatus}) at ${
        referral.toFacility?.name || "Destination Facility"
      }. Verified via QR code scan.`,
    });
  } catch (recErr) {
    console.error("Failed to append medical record on QR scan", recErr);
  }

  const populatedReferral = await Referral.findById(referral._id)
    .populate("patient", "name abhaId age gender village phone conditions riskTier")
    .populate("fromFacility", "name tier location")
    .populate("toFacility", "name tier location contactPhone")
    .populate("issuedBy", "name role qualifications phone");

  // Real-time broadcast to all doctors/ASHAs connected
  const io = getIo();
  if (io) {
    io.emit("referralUpdated", {
      type: "STATUS_CHANGED",
      scanEvent: true,
      referralCode: referral.referralCode,
      previousStatus: currentStatus,
      newStatus,
      actionName: transition.action,
      referral: populatedReferral,
      timestamp: new Date(),
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        referral: populatedReferral,
        previousStatus: currentStatus,
        newStatus,
        actionName: transition.action,
        message: `Patient successfully marked as ${transition.action.toUpperCase()} (${nextStatus})!`,
      },
      `Status successfully advanced to ${nextStatus}`
    )
  );
});
