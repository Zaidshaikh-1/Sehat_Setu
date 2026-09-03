import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["asha", "anm", "doctor", "specialist", "admin"],
      default: "asha",
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
    },
    facilityName: {
      type: String,
      default: "Rampur Sub-Centre",
    },
    phone: {
      type: String,
      trim: true,
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
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1594824813589-cf77dc8eb4ba?w=150&auto=format&fit=crop&q=80",
    },
    qualifications: {
      type: String,
      default: "Accredited Social Health Activist (ASHA)",
    },
    languages: {
      type: [String],
      default: ["Hindi", "Marathi", "English"],
    },
    incentivePoints: {
      type: Number,
      default: 1450,
    },
    tasksCompletedThisMonth: {
      type: Number,
      default: 42,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
