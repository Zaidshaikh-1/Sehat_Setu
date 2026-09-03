import mongoose, { Schema } from "mongoose";

const followupSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    assignedAsha: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
    },
    type: {
      type: String,
      enum: ["ANC Visit", "Child Immunization", "Hypertension / Diabetes", "TB DOTS Follow-up", "Post-Op / Discharge", "Pediatric Growth Check"],
      required: true,
      default: "ANC Visit",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    isHighRisk: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "missed", "escalated"],
      default: "pending",
    },
    completedDate: {
      type: Date,
    },
    observationsRecorded: {
      type: String,
    },
    vitalsRecorded: {
      systolicBP: { type: Number },
      diastolicBP: { type: Number },
      bloodSugar: { type: Number },
      weightKg: { type: Number },
      fetalHeartSound: { type: String },
    },
    incentiveAmountInr: {
      type: Number,
      default: 150, // ASHA activity incentive
    },
  },
  { timestamps: true }
);

export const Followup = mongoose.model("Followup", followupSchema);
