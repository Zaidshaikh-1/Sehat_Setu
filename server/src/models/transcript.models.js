import mongoose, { Schema } from "mongoose";

const transcriptEntrySchema = new Schema({
    speaker: {
        type: String,
        enum: ["doctor", "patient", "asha", "system"],
        default: "patient",
    },
    speakerName: {
        type: String,
        default: "Unknown",
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.9,
    },
});

const transcriptSchema = new Schema(
    {
        consultation: {
            type: Schema.Types.ObjectId,
            ref: "Consultation",
        },
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
        callMode: {
            type: String,
            enum: ["video", "voice"],
            default: "video",
        },
        status: {
            type: String,
            enum: ["active", "completed", "paused"],
            default: "active",
        },
        entries: [transcriptEntrySchema],
        summary: {
            type: String,
            default: "",
        },
        durationSeconds: {
            type: Number,
            default: 0,
        },
        language: {
            type: String,
            default: "en-IN",
        },
    },
    { timestamps: true }
);

export const Transcript = mongoose.model("Transcript", transcriptSchema);
