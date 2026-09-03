import { Patient } from "../models/patient.models.js";
import { Record } from "../models/record.models.js";
import { Consultation } from "../models/consultation.models.js";
import { Referral } from "../models/referral.models.js";
import { Triage } from "../models/triage.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllPatients = asyncHandler(async (req, res) => {
  const { search, village, condition, isHighRisk, riskTier } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { abhaId: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { village: { $regex: search, $options: "i" } },
    ];
  }

  if (village) query.village = village;
  if (condition) query.conditions = { $in: [condition] };
  if (isHighRisk === "true") {
    query.$or = [{ isHighRiskMaternal: true }, { riskTier: { $in: ["high", "critical"] } }];
  }
  if (riskTier) query.riskTier = riskTier;

  const patients = await Patient.find(query)
    .populate("assignedAsha", "name phone qualifications")
    .populate("assignedFacility", "name tier location")
    .sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, patients, `Fetched ${patients.length} patient records`)
  );
});

export const getPatientById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const patient = await Patient.findById(patientId)
    .populate("assignedAsha", "name phone qualifications village")
    .populate("assignedFacility", "name tier location contactPhone");

  if (!patient) {
    throw new ApiError(404, "Patient record not found.");
  }

  return res.status(200).json(
    new ApiResponse(200, patient, "Fetched patient profile")
  );
});

export const getPatientTimeline = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient record not found.");
  }

  // Fetch all longitudinal events across records, consultations, referrals, and triages
  const records = await Record.find({ patient: patientId })
    .populate("author", "name role")
    .populate("facility", "name tier")
    .sort({ encounterDate: -1 });

  const consultations = await Consultation.find({ patient: patientId })
    .populate("doctor", "name qualifications")
    .populate("assistedBy", "name role")
    .populate("facility", "name tier")
    .sort({ createdAt: -1 });

  const referrals = await Referral.find({ patient: patientId })
    .populate("fromFacility", "name tier")
    .populate("toFacility", "name tier")
    .populate("issuedBy", "name role")
    .sort({ createdAt: -1 });

  const triages = await Triage.find({ patient: patientId })
    .populate("conductedBy", "name role")
    .populate("facility", "name tier")
    .sort({ createdAt: -1 });

  // Merge into a coherent, dated timeline
  const unifiedTimeline = [
    ...records.map((r) => ({
      id: r._id,
      date: r.encounterDate || r.createdAt,
      type: r.type,
      title: r.title,
      subtitle: r.subtitle,
      summary: r.summary,
      author: r.author?.name || "Healthcare Staff",
      facility: r.facility?.name || "Health Facility",
      fhirResource: r.fhirResource,
      rawObj: r,
    })),
    ...consultations.map((c) => ({
      id: c._id,
      date: c.createdAt,
      type: "consultation",
      title: `Teleconsult: ${c.diagnosis}`,
      subtitle: `Doctor: ${c.doctor?.name || "Dr. Medical Officer"} (${c.mode.toUpperCase()})`,
      summary: `${c.chiefComplaint} | Advice: ${c.advice || "Standard follow-up prescribed."}`,
      prescription: c.prescription,
      author: c.doctor?.name || "Doctor",
      facility: c.facility?.name || "PHC Telemedicine Hub",
      rawObj: c,
    })),
    ...referrals.map((ref) => ({
      id: ref._id,
      date: ref.createdAt,
      type: "referral",
      title: `Referral: ${ref.fromFacility?.name} ➔ ${ref.toFacility?.name}`,
      subtitle: `Urgency: ${ref.urgency.toUpperCase()} | Status: ${ref.status.toUpperCase()}`,
      summary: `Reason: ${ref.reason} | Referral ID: ${ref.referralCode}`,
      status: ref.status,
      author: ref.issuedBy?.name || "Medical Officer",
      facility: ref.fromFacility?.name || "Referring Centre",
      rawObj: ref,
    })),
    ...triages.map((t) => ({
      id: t._id,
      date: t.createdAt,
      type: "triage",
      title: `Digital Triage: Tier ${t.riskTier.toUpperCase()}`,
      subtitle: `Conducted by ASHA: ${t.conductedBy?.name || "Frontline Worker"}`,
      summary: `${t.category} | Red Flags: ${t.redFlags?.join(", ") || "None"} | ${t.recommendation}`,
      riskTier: t.riskTier,
      author: t.conductedBy?.name || "ASHA",
      facility: t.facility?.name || "Sub-Centre",
      rawObj: t,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return res.status(200).json(
    new ApiResponse(
      200,
      { patient, timeline: unifiedTimeline },
      `Longitudinal timeline with ${unifiedTimeline.length} events retrieved`
    )
  );
});

export const createPatient = asyncHandler(async (req, res) => {
  const { name, age, gender, village, phone, bloodGroup, conditions, isPregnant, gestationalWeeks } = req.body;

  if (!name || !age || !gender) {
    throw new ApiError(400, "Patient name, age, and gender are mandatory.");
  }

  // Generate standard ABHA format mock: 14 digits with hyphens (e.g., 91-4589-2234-9102)
  const rand4 = () => Math.floor(1000 + Math.random() * 9000);
  const generatedAbha = req.body.abhaId || `91-${rand4()}-${rand4()}-${rand4()}`;

  const patient = await Patient.create({
    name,
    abhaId: generatedAbha,
    age,
    gender,
    village: village || "Rampur",
    district: req.body.district || "Pune",
    state: "Maharashtra",
    phone: phone || "+91 98" + Math.floor(10000000 + Math.random() * 90000000),
    bloodGroup: bloodGroup || "O+",
    conditions: conditions || [],
    isPregnant: Boolean(isPregnant),
    gestationalWeeks: gestationalWeeks || null,
    isHighRiskMaternal: Boolean(isPregnant && (age < 18 || age > 35 || conditions?.includes("Anemia"))),
    assignedAsha: req.user?._id || null,
    assignedFacility: req.user?.facility || null,
    emergencyContact: req.body.emergencyContact || { name: "Family Member", phone: phone, relation: "Kin" },
  });

  // Create initial enrollment longitudinal record
  await Record.create({
    patient: patient._id,
    author: req.user?._id || null,
    facility: req.user?.facility || null,
    type: "visit",
    title: "ABHA Health ID Registration & Baseline Enrollment",
    subtitle: `Registered at ${village || "Rampur Sub-Centre"}`,
    summary: `Patient enrolled with ABHA ID: ${patient.abhaId}. Baseline clinical profile and demographic registers initialized.`,
    fhirResource: {
      resourceType: "Patient",
      identifier: [{ system: "https://healthid.ndhm.gov.in", value: patient.abhaId }],
      name: [{ text: patient.name }],
      gender: patient.gender,
      birthDate: `${new Date().getFullYear() - patient.age}-01-01`,
    },
  });

  return res.status(201).json(
    new ApiResponse(201, patient, "Patient created and linked to longitudinal health record")
  );
});

export const searchByAbha = asyncHandler(async (req, res) => {
  const { abhaId } = req.params;

  const patient = await Patient.findOne({ abhaId })
    .populate("assignedAsha", "name phone")
    .populate("assignedFacility", "name tier");

  if (!patient) {
    throw new ApiError(404, "No patient matches this ABHA ID.");
  }

  return res.status(200).json(
    new ApiResponse(200, patient, "ABHA record verified successfully")
  );
});
