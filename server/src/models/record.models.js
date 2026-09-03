import mongoose, { Schema } from "mongoose";

const recordSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
    },
    type: {
      type: String,
      enum: ["visit", "triage", "prescription", "referral", "lab", "followup", "vitals", "immunization", "emergency"],
      required: true,
      default: "visit",
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    summary: {
      type: String,
      required: true,
    },
    fhirResource: {
      type: Schema.Types.Mixed,
      default: {},
    },
    attachments: [
      {
        name: { type: String },
        fileType: { type: String },
        url: { type: String },
      },
    ],
    encounterDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Record = mongoose.model("Record", recordSchema);
