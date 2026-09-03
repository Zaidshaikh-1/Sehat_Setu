import mongoose, { Schema } from "mongoose";

const consultationSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assistedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // ASHA / ANM present with patient
    },
    triage: {
      type: Schema.Types.ObjectId,
      ref: "Triage",
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
    },
    mode: {
      type: String,
      enum: ["video", "voice", "store-forward"],
      default: "video",
    },
    chiefComplaint: {
      type: String,
      required: true,
    },
    clinicalObservations: {
      type: String,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    advice: {
      type: String,
    },
    prescription: [
      {
        medicine: { type: String, required: true },
        dosage: { type: String, default: "1 tablet" },
        frequency: { type: String, default: "Twice daily (1-0-1)" },
        duration: { type: String, default: "5 days" },
        instructions: { type: String, default: "After meals" },
      },
    ],
    testsOrdered: {
      type: [String],
      default: [],
    },
    referralNeeded: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "completed",
    },
    durationMinutes: {
      type: Number,
      default: 12,
    },
  },
  { timestamps: true }
);

export const Consultation = mongoose.model("Consultation", consultationSchema);
