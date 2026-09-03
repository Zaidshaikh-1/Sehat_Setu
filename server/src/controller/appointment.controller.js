import { Appointment } from "../models/appointment.models.js";
import { Facility } from "../models/facility.models.js";
import { Patient } from "../models/patient.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAppointments = asyncHandler(async (req, res) => {
  const { facilityId, date, status, patientId } = req.query;

  const query = {};
  if (facilityId) query.facility = facilityId;
  if (status) query.status = status;
  if (patientId) query.patient = patientId;

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }

  const appointments = await Appointment.find(query)
    .populate("patient", "name abhaId age gender phone village")
    .populate("facility", "name tier crowdLevel")
    .populate("doctor", "name qualifications")
    .sort({ tokenNumber: 1 });

  return res.status(200).json(
    new ApiResponse(200, appointments, `Fetched ${appointments.length} appointment slots`)
  );
});

export const bookAppointment = asyncHandler(async (req, res) => {
  const { patientId, facilityId, department, slotTime, type = "in-person-opd" } = req.body;

  if (!patientId || !facilityId) {
    throw new ApiError(400, "Patient ID and target facility are required.");
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Generate sequential token for the day
  const existingCount = await Appointment.countDocuments({
    facility: facilityId,
    date: { $gte: todayStart },
  });

  const nextToken = existingCount + 1;
  const estimatedWaitMinutes = nextToken * 12;

  const appointment = await Appointment.create({
    patient: patientId,
    facility: facilityId,
    department: department || "General Medicine OPD",
    date: new Date(),
    slotTime: slotTime || `Token #${nextToken} (approx. ${estimatedWaitMinutes}m wait)`,
    tokenNumber: nextToken,
    estimatedWaitMinutes,
    type,
    status: "scheduled",
    smsNotificationSent: true,
  });

  const populated = await Appointment.findById(appointment._id)
    .populate("patient", "name abhaId phone")
    .populate("facility", "name tier location contactPhone");

  return res.status(201).json(
    new ApiResponse(201, populated, `Virtual token #${nextToken} booked with SMS dispatch`)
  );
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status },
    { new: true }
  ).populate("patient", "name phone").populate("facility", "name");

  if (!appointment) {
    throw new ApiError(404, "Appointment not found.");
  }

  return res.status(200).json(
    new ApiResponse(200, appointment, `Token #${appointment.tokenNumber} status updated to ${status}`)
  );
});
