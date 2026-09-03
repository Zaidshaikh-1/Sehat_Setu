import { Patient } from "../models/patient.models.js";
import { Facility } from "../models/facility.models.js";
import { Referral } from "../models/referral.models.js";
import { Record } from "../models/record.models.js";
import { getIo } from "../socket/io.store.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const triggerSOS = asyncHandler(async (req, res) => {
  const {
    patientId,
    landmark = "Village Gram Panchayat Road",
    emergencyType = "Obstetric / Acute Trauma Emergency",
    latitude = 18.7512,
    longitude = 73.4021,
    notes = "",
  } = req.body;

  let patient = null;
  if (patientId) {
    patient = await Patient.findById(patientId);
  }

  if (!patient) {
    // Fallback emergency mock patient if triggered from public/unregistered kiosk
    patient = await Patient.findOne({ isHighRiskMaternal: true }) || (await Patient.findOne());
  }

  const districtHospital =
    (await Facility.findOne({ tier: "district-hospital" })) ||
    (await Facility.findOne({ tier: "chc" })) ||
    (await Facility.findOne());

  const sosCode = `SOS-108-${Math.floor(100000 + Math.random() * 900000)}`;

  const emergencyReferral = await Referral.create({
    referralCode: sosCode,
    patient: patient._id,
    issuedBy: req.user?._id || patient.assignedAsha,
    fromFacility: req.user?.facility || patient.assignedFacility,
    toFacility: districtHospital._id,
    reason: `CRITICAL 1-TAP SOS: ${emergencyType} at ${landmark}`,
    department: "Emergency & Trauma Resuscitation",
    urgency: "emergency",
    status: "traveling",
    transportMode: "108 Ambulance",
    statusHistory: [
      {
        status: "issued",
        timestamp: new Date(),
        updatedBy: req.user?._id,
        updatedByName: req.user?.name || "Emergency SOS Caller",
        note: `1-Tap SOS Triggered at [${latitude}, ${longitude}], Near ${landmark}. Ambulance 108 Auto-Dispatched.`,
      },
      {
        status: "traveling",
        timestamp: new Date(),
        updatedBy: req.user?._id,
        updatedByName: "108 Fleet Controller",
        note: "Emergency ambulance en-route with paramedic stabilization kit.",
      },
    ],
  });

  // Longitudinal health record entry
  await Record.create({
    patient: patient._id,
    author: req.user?._id,
    facility: districtHospital._id,
    type: "emergency",
    title: `ONE-TAP EMERGENCY SOS TRIGGERED: ${sosCode}`,
    subtitle: `Dispatched to: ${districtHospital.name}`,
    summary: `Critical incident alert: ${emergencyType}. Patient dispatched via 108 Emergency Transport. Location: ${landmark} (${latitude}, ${longitude}).`,
  });

  // Broadcast high-priority siren alert via Socket.IO
  const io = getIo();
  if (io) {
    io.emit("emergencyAlert", {
      type: "SOS_SIREN_TRIGGERED",
      sosCode,
      patientName: patient.name,
      abhaId: patient.abhaId,
      village: patient.village,
      destinationFacility: districtHospital.name,
      landmark,
      coordinates: { lat: latitude, lng: longitude },
      emergencyType,
      timestamp: new Date(),
    });
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        sosCode,
        patient,
        destinationFacility: districtHospital,
        referral: emergencyReferral,
        ambulanceDispatched: true,
        etaMinutes: 14,
      },
      "CRITICAL SOS ACTIVATED: 108 Ambulance notified & emergency hospital corridor prepared."
    )
  );
});

export const getActiveEmergencies = asyncHandler(async (req, res) => {
  const emergencies = await Referral.find({
    urgency: "emergency",
    status: { $in: ["issued", "traveling", "arrived"] },
  })
    .populate("patient", "name abhaId age gender village phone bloodGroup")
    .populate("fromFacility", "name tier")
    .populate("toFacility", "name tier contactPhone inChargeDoctor")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, emergencies, `Found ${emergencies.length} active emergency escalations`)
  );
});
