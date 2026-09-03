import { Followup } from "../models/followup.models.js";
import { Patient } from "../models/patient.models.js";
import { User } from "../models/user.models.js";
import { Record } from "../models/record.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAshaWorklist = asyncHandler(async (req, res) => {
  const ashaId = req.user?._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const followups = await Followup.find({
    status: { $in: ["pending", "escalated"] },
  })
    .populate("patient", "name abhaId age gender village phone conditions riskTier isPregnant isHighRiskMaternal")
    .populate("assignedAsha", "name phone incentivePoints")
    .populate("facility", "name tier")
    .sort({ isHighRisk: -1, dueDate: 1 });

  const completedToday = await Followup.find({
    status: "completed",
    updatedAt: { $gte: today },
  }).populate("patient", "name abhaId village");

  const totalIncentivesEarned = completedToday.reduce((acc, f) => acc + (f.incentiveAmountInr || 150), 0);

  const stats = {
    totalPending: followups.length,
    highRiskCount: followups.filter((f) => f.isHighRisk).length,
    dueTodayCount: followups.filter((f) => new Date(f.dueDate) <= new Date()).length,
    completedTodayCount: completedToday.length,
    todayIncentivesInr: totalIncentivesEarned,
  };

  return res.status(200).json(
    new ApiResponse(200, { worklist: followups, completedToday, stats }, "ASHA daily worklist loaded")
  );
});

export const getAllFollowups = asyncHandler(async (req, res) => {
  const { patientId, type, status, isHighRisk } = req.query;

  const query = {};
  if (patientId) query.patient = patientId;
  if (type) query.type = type;
  if (status) query.status = status;
  if (isHighRisk !== undefined) query.isHighRisk = isHighRisk === "true";

  const followups = await Followup.find(query)
    .populate("patient", "name abhaId age gender village phone conditions riskTier")
    .populate("assignedAsha", "name phone qualifications")
    .sort({ dueDate: 1 });

  return res.status(200).json(
    new ApiResponse(200, followups, `Fetched ${followups.length} follow-up schedules`)
  );
});

export const createFollowup = asyncHandler(async (req, res) => {
  const {
    patientId,
    type = "ANC Visit",
    title,
    description,
    dueDate,
    isHighRisk = false,
    incentiveAmountInr = 150,
  } = req.body;

  if (!patientId || !title || !dueDate) {
    throw new ApiError(400, "Patient ID, title, and due date are required.");
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found.");
  }

  const followup = await Followup.create({
    patient: patientId,
    assignedAsha: req.user?._id || patient.assignedAsha,
    facility: req.user?.facility || patient.assignedFacility,
    type,
    title,
    description,
    dueDate: new Date(dueDate),
    isHighRisk: Boolean(isHighRisk || patient.isHighRiskMaternal),
    status: "pending",
    incentiveAmountInr,
  });

  const populated = await Followup.findById(followup._id)
    .populate("patient", "name abhaId village phone")
    .populate("assignedAsha", "name phone");

  return res.status(201).json(
    new ApiResponse(201, populated, "Scheduled high-risk follow-up task added to ASHA worklist")
  );
});

export const completeFollowup = asyncHandler(async (req, res) => {
  const { followupId } = req.params;
  const { observations, vitals } = req.body;

  const followup = await Followup.findById(followupId).populate("patient");
  if (!followup) {
    throw new ApiError(404, "Follow-up record not found.");
  }

  followup.status = "completed";
  followup.completedDate = new Date();
  followup.observationsRecorded = observations || "Routine home checkup conducted.";
  if (vitals) followup.vitalsRecorded = vitals;
  await followup.save();

  // Credit ASHA user incentive points
  if (followup.assignedAsha) {
    await User.findByIdAndUpdate(followup.assignedAsha, {
      $inc: { incentivePoints: followup.incentiveAmountInr || 150, tasksCompletedThisMonth: 1 },
    });
  }

  // Add longitudinal timeline entry
  await Record.create({
    patient: followup.patient._id,
    author: req.user?._id,
    facility: req.user?.facility,
    type: "followup",
    title: `Follow-up Completed: ${followup.title}`,
    subtitle: `ASHA Visit | Type: ${followup.type}`,
    summary: `Observations: ${observations || "Patient stable at home."} Vitals: BP ${vitals?.systolicBP || "--"}/${vitals?.diastolicBP || "--"} mmHg, Blood Sugar: ${vitals?.bloodSugar || "--"} mg/dL.`,
  });

  const populated = await Followup.findById(followupId)
    .populate("patient", "name abhaId village")
    .populate("assignedAsha", "name incentivePoints");

  return res.status(200).json(
    new ApiResponse(200, populated, `Follow-up completed. ₹${followup.incentiveAmountInr} credited to ASHA incentive wallet.`)
  );
});
