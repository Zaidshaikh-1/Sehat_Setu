import mongoose, { Schema } from "mongoose";

const triageSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    conductedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
    },
    category: {
      type: String,
      enum: ["Maternal", "Child Health", "Respiratory", "Gastrointestinal", "NCD / Cardiac", "General / Fever", "Emergency"],
      default: "General / Fever",
    },
    symptoms: [
      {
        name: { type: String, required: true },
        severity: { type: String, enum: ["mild", "moderate", "severe"], default: "moderate" },
        duration: { type: String, default: "1-2 days" },
      },
    ],
    vitalsRecorded: {
      systolicBP: { type: Number },
      diastolicBP: { type: Number },
      spO2: { type: Number },
      pulseRate: { type: Number },
      temperature: { type: Number },
      bloodSugar: { type: Number },
    },
    riskTier: {
      type: String,
      enum: ["self-care", "visit-phc", "urgent-referral", "emergency"],
      required: true,
      default: "visit-phc",
    },
    redFlags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
    },
    recommendation: {
      type: String,
    },
    autoReferralTriggered: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["triaged", "teleconsult-pending", "referred", "resolved"],
      default: "triaged",
    },
  },
  { timestamps: true }
);

export const Triage = mongoose.model("Triage", triageSchema);
