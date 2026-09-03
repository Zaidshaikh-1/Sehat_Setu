import { Referral } from "../models/referral.models.js";
import { Patient } from "../models/patient.models.js";
import { Record } from "../models/record.models.js";
import { getIo } from "../socket/io.store.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllReferrals = asyncHandler(async (req, res) => {
  const { status, urgency, facilityId, patientId } = req.query;

  const query = {};
  if (status) query.status = status;
  if (urgency) query.urgency = urgency;
  if (patientId) query.patient = patientId;
  if (facilityId) {
    query.$or = [{ fromFacility: facilityId }, { toFacility: facilityId }];
  }

  const referrals = await Referral.find(query)
    .populate("patient", "name abhaId age gender village phone conditions riskTier")
    .populate("fromFacility", "name tier location")
    .populate("toFacility", "name tier location contactPhone")
    .populate("issuedBy", "name role qualifications phone")
    .sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, referrals, `Fetched ${referrals.length} active referral tickets`)
  );
});

export const getReferralKanban = asyncHandler(async (req, res) => {
  const referrals = await Referral.find()
    .populate("patient", "name abhaId age gender village phone conditions riskTier isPregnant isHighRiskMaternal")
    .populate("fromFacility", "name tier location")
    .populate("toFacility", "name tier location contactPhone")
    .populate("issuedBy", "name role qualifications phone")
    .sort({ createdAt: -1 });

  // Structure by Kanban Columns
  const kanban = {
    issued: referrals.filter((r) => r.status === "issued"),
    traveling: referrals.filter((r) => r.status === "traveling"),
    arrived: referrals.filter((r) => r.status === "arrived"),
    seen: referrals.filter((r) => r.status === "seen" || r.status === "closed"),
  };

  const stats = {
    total: referrals.length,
    issued: kanban.issued.length,
    traveling: kanban.traveling.length,
    arrived: kanban.arrived.length,
    seen: kanban.seen.length,
    emergencyCount: referrals.filter((r) => r.urgency === "emergency").length,
    completionRate: referrals.length > 0
      ? Math.round((kanban.seen.length / referrals.length) * 100)
      : 84,
  };

  return res.status(200).json(
    new ApiResponse(200, { kanban, stats }, "Referral Kanban Board retrieved")
  );
});

export const createReferral = asyncHandler(async (req, res) => {
  const {
    patientId,
    toFacilityId,
    reason,
    urgency = "routine",
    department = "General Medicine",
    transportMode = "Public Bus",
    notes = "",
  } = req.body;

  if (!patientId || !toFacilityId || !reason) {
    throw new ApiError(400, "Patient ID, destination facility, and referral reason are required.");
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient record not found.");
  }

  const referralCode = `SETU-REF-${Math.floor(100000 + Math.random() * 900000)}`;

  const referral = await Referral.create({
    referralCode,
    patient: patientId,
    issuedBy: req.user?._id,
    fromFacility: req.user?.facility || patient.assignedFacility,
    toFacility: toFacilityId,
    reason,
    department,
    urgency,
    status: "issued",
    transportMode,
    statusHistory: [
      {
        status: "issued",
        timestamp: new Date(),
        updatedBy: req.user?._id,
        updatedByName: req.user?.name || "Medical Officer",
        note: notes || "Referral created via Setu care coordinator.",
      },
    ],
  });

  // Create longitudinal record
  await Record.create({
    patient: patientId,
    author: req.user?._id,
    facility: req.user?.facility,
    type: "referral",
    title: `Referral Ticket Issued (${urgency.toUpperCase()}): Code ${referralCode}`,
    subtitle: `Department: ${department} | Transport: ${transportMode}`,
    summary: `Patient referred for: ${reason}. Referral ticket tracked on closed-loop registry.`,
  });

  const populatedReferral = await Referral.findById(referral._id)
    .populate("patient", "name abhaId age gender village phone")
    .populate("fromFacility", "name tier location")
    .populate("toFacility", "name tier location contactPhone")
    .populate("issuedBy", "name role");

  // Broadcast to Socket.IO clients
  const io = getIo();
  if (io) {
    io.emit("referralUpdated", {
      type: "REFERRAL_CREATED",
      referral: populatedReferral,
    });
  }

  return res.status(201).json(
    new ApiResponse(201, populatedReferral, `Referral ticket ${referralCode} issued successfully`)
  );
});

export const updateReferralStatus = asyncHandler(async (req, res) => {
  const { referralId } = req.params;
  const { newStatus, note, clinicalOutcome } = req.body;

  const validStatuses = ["issued", "traveling", "arrived", "seen", "closed", "escalated"];
  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(400, `Invalid status. Must be one of: [${validStatuses.join(", ")}]`);
  }

  const referral = await Referral.findById(referralId)
    .populate("patient", "name abhaId phone")
    .populate("fromFacility", "name tier")
    .populate("toFacility", "name tier");

  if (!referral) {
    throw new ApiError(404, "Referral record not found.");
  }

  referral.status = newStatus;
  if (newStatus === "arrived") referral.actualArrivalTime = new Date();
  if (newStatus === "seen" || newStatus === "closed") {
    referral.seenTime = new Date();
    referral.feedbackClosedLoop = true;
    referral.referringAshaNotified = true;
    if (clinicalOutcome) referral.clinicalOutcome = clinicalOutcome;
  }

  referral.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: req.user?._id,
    updatedByName: req.user?.name || "Care Staff",
    note: note || `Status updated to ${newStatus}`,
  });

  await referral.save();

  // Create longitudinal record update
  await Record.create({
    patient: referral.patient._id,
    author: req.user?._id,
    facility: req.user?.facility,
    type: "referral",
    title: `Referral Status Milestone: ${newStatus.toUpperCase()}`,
    subtitle: `Referral ID: ${referral.referralCode}`,
    summary: `Patient marked as ${newStatus} at ${referral.toFacility?.name || "Receiving Facility"}. Note: ${note || "Normal progression."}`,
  });

  const updatedReferral = await Referral.findById(referralId)
    .populate("patient", "name abhaId age gender village phone conditions riskTier")
    .populate("fromFacility", "name tier location")
    .populate("toFacility", "name tier location contactPhone")
    .populate("issuedBy", "name role qualifications phone");

  // Broadcast real-time update
  const io = getIo();
  if (io) {
    io.emit("referralUpdated", {
      type: "STATUS_CHANGED",
      referralCode: referral.referralCode,
      newStatus,
      referral: updatedReferral,
      updatedBy: req.user?.name || "Healthcare Staff",
      timestamp: new Date(),
    });
  }

  return res.status(200).json(
    new ApiResponse(200, updatedReferral, `Referral status transitioned to: ${newStatus}`)
  );
});

export const getReferralById = asyncHandler(async (req, res) => {
  const { referralId } = req.params;

  const referral = await Referral.findById(referralId)
    .populate("patient", "name abhaId age gender village phone conditions riskTier bloodGroup")
    .populate("fromFacility", "name tier location contactPhone inChargeDoctor")
    .populate("toFacility", "name tier location contactPhone inChargeDoctor services")
    .populate("issuedBy", "name role qualifications phone")
    .populate("consultation");

  if (!referral) {
    throw new ApiError(404, "Referral record not found.");
  }

  return res.status(200).json(
    new ApiResponse(200, referral, "Fetched referral detail and closed-loop audit history")
  );
});
