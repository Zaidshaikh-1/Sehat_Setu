import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    department: {
      type: String,
      default: "General OPD",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    slotTime: {
      type: String,
      default: "10:30 AM - 11:00 AM",
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 15,
    },
    type: {
      type: String,
      enum: ["in-person-opd", "teleconsultation", "lab-collection", "anc-checkup"],
      default: "in-person-opd",
    },
    status: {
      type: String,
      enum: ["scheduled", "checked-in", "in-consultation", "completed", "no-show", "cancelled"],
      default: "scheduled",
    },
    smsNotificationSent: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
