import mongoose, { Schema } from "mongoose";

const diagnosticSchema = new Schema(
  {
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Blood / Hematology", "Biochemistry", "Urine", "Radiology / Imaging", "Microbiology / TB", "Maternal Panel", "Cardiology / ECG"],
      default: "Blood / Hematology",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    turnaroundHours: {
      type: Number,
      default: 4,
    },
    equipmentStatus: {
      type: String,
      enum: ["working", "broken", "calibrating", "unavailable"],
      default: "working",
    },
    costInr: {
      type: Number,
      default: 0, // Free at government PHCs
    },
    sampleRequirements: {
      type: String,
      default: "Fasting not required",
    },
  },
  { timestamps: true }
);

export const Diagnostic = mongoose.model("Diagnostic", diagnosticSchema);
