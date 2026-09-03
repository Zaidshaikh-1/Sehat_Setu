import mongoose, { Schema } from "mongoose";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Blood compatibility rules: Recipient -> compatible Donors
export const BLOOD_COMPATIBILITY = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // Universal recipient
  "AB-": ["AB-", "A-", "B-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"], // Universal donor
};

// 1. Facility Blood Inventory
const bloodInventorySchema = new Schema(
  {
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    bloodType: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    unitsAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumThreshold: {
      type: Number,
      default: 3,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Composite unique index for facility + bloodType
bloodInventorySchema.index({ facility: 1, bloodType: 1 }, { unique: true });

export const BloodInventory = mongoose.model("BloodInventory", bloodInventorySchema);

// 2. Community Blood Donor Registry
const bloodDonorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    bloodType: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    age: {
      type: Number,
      min: 18,
      max: 65,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    village: {
      type: String,
      default: "Rampur",
    },
    district: {
      type: String,
      default: "Pune",
    },
    state: {
      type: String,
      default: "Maharashtra",
    },
    coordinates: {
      lat: { type: Number, default: 18.75 },
      lng: { type: Number, default: 73.40 },
    },
    lastDonationDate: {
      type: Date,
    },
    isWilling: {
      type: Boolean,
      default: true,
    },
    isEligible: {
      type: Boolean,
      default: true,
    },
    registeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const BloodDonor = mongoose.model("BloodDonor", bloodDonorSchema);

// 3. Clinical Blood Request Workflow
const bloodRequestSchema = new Schema(
  {
    requestCode: {
      type: String,
      unique: true,
      required: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    patientName: {
      type: String,
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    bloodType: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    unitsNeeded: {
      type: Number,
      default: 1,
      min: 1,
    },
    urgency: {
      type: String,
      enum: ["routine", "urgent", "emergency"],
      default: "urgent",
    },
    status: {
      type: String,
      enum: ["pending", "matched", "fulfilled", "cancelled"],
      default: "pending",
    },
    matchedDonors: [
      {
        type: Schema.Types.ObjectId,
        ref: "BloodDonor",
      },
    ],
    notes: {
      type: String,
      default: "",
    },
    fulfilledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);

// 4. Donation History Log
const donationHistorySchema = new Schema(
  {
    donor: {
      type: Schema.Types.ObjectId,
      ref: "BloodDonor",
    },
    donorName: {
      type: String,
      required: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    patientName: {
      type: String,
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
    },
    facilityName: {
      type: String,
      default: "Pune District Hospital Blood Bank",
    },
    bloodType: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    unitsDonated: {
      type: Number,
      default: 1,
    },
    donatedAt: {
      type: Date,
      default: Date.now,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const DonationHistory = mongoose.model("DonationHistory", donationHistorySchema);
