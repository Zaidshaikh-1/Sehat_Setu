import { Consultation } from "../models/consultation.models.js";
import { Patient } from "../models/patient.models.js";
import { Record } from "../models/record.models.js";
import { Triage } from "../models/triage.models.js";
import { Referral } from "../models/referral.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createConsultation = asyncHandler(async (req, res) => {
  const {
    patientId,
    triageId,
    mode = "video",
    chiefComplaint,
    clinicalObservations,
    diagnosis,
    advice,
    prescription = [],
    testsOrdered = [],
    referralNeeded = false,
    referralDetails = {},
    followUpDate,
  } = req.body;

  if (!patientId || !chiefComplaint || !diagnosis) {
    throw new ApiError(400, "Patient ID, chief complaint, and clinical diagnosis are required.");
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found.");
  }

  const consultation = await Consultation.create({
    patient: patientId,
    doctor: req.user?._id,
    assistedBy: req.body.assistedBy || patient.assignedAsha,
    triage: triageId || null,
    facility: req.user?.facility || patient.assignedFacility,
    mode,
    chiefComplaint,
    clinicalObservations: clinicalObservations || "Physical exam performed via assisted video link.",
    diagnosis,
    advice: advice || "Complete prescribed course and return for follow-up if symptoms persist.",
    prescription,
    testsOrdered,
    referralNeeded,
    followUpDate: followUpDate || null,
    status: "completed",
    durationMinutes: req.body.durationMinutes || 14,
  });

  // If linked to a triage, update triage status
  if (triageId) {
    await Triage.findByIdAndUpdate(triageId, { status: "resolved" });
  }

  // Auto-generate longitudinal health record
  await Record.create({
    patient: patientId,
    author: req.user?._id,
    facility: req.user?.facility,
    type: "prescription",
    title: `Consultation Encounter: ${diagnosis}`,
    subtitle: `Doctor: ${req.user?.name || "Medical Officer"} | Mode: ${mode.toUpperCase()}`,
    summary: `Diagnosis: ${diagnosis}. Rx: ${prescription.map((p) => p.medicine).join(", ") || "Supportive care"}. Advice: ${advice || "Follow up scheduled."}`,
    fhirResource: {
      resourceType: "Encounter",
      status: "finished",
      reasonCode: [{ text: chiefComplaint }],
      diagnosis: [{ condition: { display: diagnosis } }],
      prescription: prescription,
    },
  });

  let createdReferral = null;

  // Handle downstream referral if ordered by doctor during consult
  if (referralNeeded && referralDetails.toFacility) {
    const refCode = `REF-SETU-${Math.floor(100000 + Math.random() * 900000)}`;

    createdReferral = await Referral.create({
      referralCode: refCode,
      patient: patientId,
      issuedBy: req.user?._id,
      fromFacility: req.user?.facility || patient.assignedFacility,
      toFacility: referralDetails.toFacility,
      consultation: consultation._id,
      reason: referralDetails.reason || `Specialist management required for: ${diagnosis}`,
      urgency: referralDetails.urgency || "routine",
      department: referralDetails.department || "Specialist OPD",
      status: "issued",
      transportMode: referralDetails.transportMode || "Public Bus",
      statusHistory: [
        {
          status: "issued",
          timestamp: new Date(),
          updatedBy: req.user?._id,
          updatedByName: req.user?.name || "Dr. Medical Officer",
          note: `Consultation referral issued for: ${diagnosis}`,
        },
      ],
    });
  }

  const populatedConsultation = await Consultation.findById(consultation._id)
    .populate("doctor", "name qualifications email phone")
    .populate("assistedBy", "name role phone")
    .populate("facility", "name tier location");

  return res.status(201).json(
    new ApiResponse(
      201,
      { consultation: populatedConsultation, referral: createdReferral },
      "Consultation note finalized and saved to longitudinal health record"
    )
  );
});

export const getConsultationById = asyncHandler(async (req, res) => {
  const { consultationId } = req.params;

  const consult = await Consultation.findById(consultationId)
    .populate("patient", "name abhaId age gender village phone")
    .populate("doctor", "name qualifications email phone")
    .populate("assistedBy", "name role phone")
    .populate("facility", "name tier location");

  if (!consult) {
    throw new ApiError(404, "Consultation encounter not found.");
  }

  return res.status(200).json(
    new ApiResponse(200, consult, "Fetched consultation details")
  );
});

export const getPatientConsultations = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const consults = await Consultation.find({ patient: patientId })
    .populate("doctor", "name qualifications")
    .populate("assistedBy", "name role")
    .populate("facility", "name tier")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, consults, `Fetched ${consults.length} consultation encounters`)
  );
});
