import mongoose, { Schema } from "mongoose";

const referralSchema = new Schema(
  {
    referralCode: {
      type: String,
      unique: true,
      required: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromFacility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    toFacility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    consultation: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
    },
    triage: {
      type: Schema.Types.ObjectId,
      ref: "Triage",
    },
    reason: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "General Medicine",
    },
    urgency: {
      type: String,
      enum: ["routine", "urgent", "emergency"],
      default: "routine",
      required: true,
    },
    status: {
      type: String,
      enum: ["issued", "traveling", "arrived", "seen", "closed", "escalated"],
      default: "issued",
      required: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        updatedByName: { type: String },
        note: { type: String },
      },
    ],
    transportMode: {
      type: String,
      enum: ["108 Ambulance", "Public Bus", "Auto / Shared Cab", "Family Two-Wheeler", "Walking"],
      default: "Public Bus",
    },
    expectedArrivalTime: {
      type: Date,
    },
    actualArrivalTime: {
      type: Date,
    },
    seenTime: {
      type: Date,
    },
    clinicalOutcome: {
      type: String,
    },
    feedbackClosedLoop: {
      type: Boolean,
      default: false,
    },
    referringAshaNotified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Referral = mongoose.model("Referral", referralSchema);
