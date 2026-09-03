import mongoose, { Schema } from "mongoose";

const patientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    abhaId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    village: {
      type: String,
      required: true,
      default: "Rampur",
    },
    district: {
      type: String,
      required: true,
      default: "Pune",
    },
    state: {
      type: String,
      default: "Maharashtra",
    },
    phone: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      default: "B+",
    },
    conditions: {
      type: [String],
      default: [],
    },
    riskTier: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      default: "low",
    },
    assignedAsha: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedFacility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    vitalsLatest: {
      systolicBP: { type: Number },
      diastolicBP: { type: Number },
      spO2: { type: Number },
      pulseRate: { type: Number },
      temperature: { type: Number },
      bloodSugar: { type: Number },
      hemoglobin: { type: Number },
      weightKg: { type: Number },
      lastRecorded: { type: Date, default: Date.now },
    },
    isPregnant: {
      type: Boolean,
      default: false,
    },
    gestationalWeeks: {
      type: Number,
    },
    isHighRiskMaternal: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);
