import mongoose, { Schema } from "mongoose";

const medicineSchema = new Schema(
  {
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Antibiotics", "Antihypertensives", "Antidiabetic", "Analgesics / Antipyretics", "Maternal / Iron-Folic", "Pediatric / ORS", "Emergency / Life-Saving"],
      default: "Analgesics / Antipyretics",
    },
    currentStock: {
      type: Number,
      required: true,
      default: 100,
    },
    minimumThreshold: {
      type: Number,
      default: 20,
    },
    unit: {
      type: String,
      default: "tablets",
    },
    isStockOut: {
      type: Boolean,
      default: false,
    },
    batchNumber: {
      type: String,
      default: "MED-2026-B89",
    },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    lastRestockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to flag stockout if stock drops below threshold
medicineSchema.pre("save", function (next) {
  this.isStockOut = this.currentStock <= this.minimumThreshold;
  next();
});

export const Medicine = mongoose.model("Medicine", medicineSchema);
