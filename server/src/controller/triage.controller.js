import { Triage } from "../models/triage.models.js";
import { Patient } from "../models/patient.models.js";
import { Record } from "../models/record.models.js";
import { Referral } from "../models/referral.models.js";
import { Facility } from "../models/facility.models.js";
import { evaluateTriage } from "../utils/triageEngine.js";
import { getIo } from "../socket/io.store.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const submitTriage = asyncHandler(async (req, res) => {
  const {
    patientId,
    category = "General / Fever",
    symptoms = [],
    vitals = {},
    notes = "",
  } = req.body;

  if (!patientId) {
    throw new ApiError(400, "Patient ID is required for triage assessment.");
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found.");
  }

  // Run on-device/server rules engine
  const triageEvaluation = evaluateTriage({
    category,
    symptoms,
    vitals,
    isPregnant: patient.isPregnant,
    isChild: patient.age <= 5,
    notes,
  });

  const triage = await Triage.create({
    patient: patientId,
    conductedBy: req.user?._id || patient.assignedAsha,
    facility: req.user?.facility || patient.assignedFacility,
    category,
    symptoms: symptoms.map((s) => (typeof s === "string" ? { name: s, severity: "moderate" } : s)),
    vitalsRecorded: vitals,
    riskTier: triageEvaluation.riskTier,
    redFlags: triageEvaluation.redFlags,
    notes,
    recommendation: triageEvaluation.recommendation,
    autoReferralTriggered: triageEvaluation.autoReferral,
    status: triageEvaluation.autoReferral ? "referred" : "triaged",
  });

  // Update patient's latest risk profile and vitals
  patient.riskTier =
    triageEvaluation.riskTier === "emergency"
      ? "critical"
      : triageEvaluation.riskTier === "urgent-referral"
      ? "high"
      : triageEvaluation.riskTier === "visit-phc"
      ? "moderate"
      : "low";

  if (vitals && Object.keys(vitals).length > 0) {
    patient.vitalsLatest = {
      ...patient.vitalsLatest,
      ...vitals,
      lastRecorded: new Date(),
    };
  }
  await patient.save();

  // Create longitudinal timeline record
  await Record.create({
    patient: patientId,
    author: req.user?._id,
    facility: req.user?.facility,
    type: triageEvaluation.riskTier === "emergency" ? "emergency" : "triage",
    title: `Digital Triage Assessment: ${triageEvaluation.riskTier.toUpperCase()}`,
    subtitle: `Category: ${category} | Red Flags: ${triageEvaluation.redFlags.length}`,
    summary: `${triageEvaluation.recommendation} Actions: ${triageEvaluation.actionRequired}`,
    fhirResource: {
      resourceType: "ClinicalImpression",
      status: "completed",
      riskAssessment: [{ code: triageEvaluation.riskTier, basis: triageEvaluation.redFlags }],
      investigation: [{ item: symptoms }],
    },
  });

  let emergencyReferral = null;

  // Auto-generate emergency referral if red-flag danger sign detected
  if (triageEvaluation.autoReferral) {
    const districtHospital = await Facility.findOne({ tier: "district-hospital" }) || req.user?.facility;
    const referralCode = `EMERG-SETU-${Math.floor(100000 + Math.random() * 900000)}`;

    emergencyReferral = await Referral.create({
      referralCode,
      patient: patientId,
      issuedBy: req.user?._id,
      fromFacility: req.user?.facility || patient.assignedFacility,
      toFacility: districtHospital?._id || req.user?.facility,
      triage: triage._id,
      reason: `EMERGENCY ESCALATION: ${triageEvaluation.redFlags.join(", ") || "Critical Triage Finding"}`,
      urgency: "emergency",
      status: "issued",
      transportMode: "108 Ambulance",
      statusHistory: [
        {
          status: "issued",
          timestamp: new Date(),
          updatedBy: req.user?._id,
          updatedByName: req.user?.name || "ASHA Frontline",
          note: `Auto-emergency escalation triggered: ${triageEvaluation.redFlags.join("; ")}`,
        },
      ],
    });

    // Real-time broadcast to all facilities via Socket.IO
    const io = getIo();
    if (io) {
      io.emit("emergencyAlert", {
        patientName: patient.name,
        abhaId: patient.abhaId,
        village: patient.village,
        referralCode,
        redFlags: triageEvaluation.redFlags,
        timestamp: new Date(),
        facilityName: req.user?.facilityName || "Sub-Centre",
      });
    }
  }

  const populatedTriage = await Triage.findById(triage._id)
    .populate("conductedBy", "name role phone")
    .populate("facility", "name tier");

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        triage: populatedTriage,
        evaluation: triageEvaluation,
        emergencyReferral,
      },
      `Triage assessment completed with risk tier: ${triageEvaluation.riskTier}`
    )
  );
});

export const getTriageHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const triages = await Triage.find({ patient: patientId })
    .populate("conductedBy", "name role")
    .populate("facility", "name tier")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, triages, "Fetched triage history")
  );
});
