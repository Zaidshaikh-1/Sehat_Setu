import mongoose, { Schema } from "mongoose";

const facilitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    facilityCode: {
      type: String,
      unique: true,
      trim: true,
    },
    tier: {
      type: String,
      enum: ["sub-centre", "phc", "chc", "district-hospital"],
      required: true,
      default: "phc",
    },
    location: {
      village: { type: String, default: "Khandala" },
      block: { type: String, default: "Maval" },
      district: { type: String, default: "Pune" },
      state: { type: String, default: "Maharashtra" },
      coordinates: {
        lat: { type: Number, default: 18.75 },
        lng: { type: Number, default: 73.40 },
      },
    },
    contactPhone: {
      type: String,
      default: "+91 2114 273001",
    },
    inChargeDoctor: {
      type: String,
      default: "Dr. Prakash Sharma, MBBS, MD",
    },
    totalBeds: {
      type: Number,
      default: 20,
    },
    availableBeds: {
      type: Number,
      default: 8,
    },
    crowdLevel: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      default: "moderate",
    },
    services: {
      type: [String],
      default: ["OPD", "Maternal Care", "Emergency First Aid", "Immunization", "Basic Lab", "Pharmacy"],
    },
    equipmentStatus: [
      {
        name: { type: String, required: true },
        status: { type: String, enum: ["working", "broken", "maintenance", "unavailable"], default: "working" },
        lastChecked: { type: Date, default: Date.now },
      },
    ],
    ambulanceAvailable: {
      type: Boolean,
      default: true,
    },
    teleconsultCapable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Facility = mongoose.model("Facility", facilitySchema);
