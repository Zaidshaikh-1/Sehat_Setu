import { Transcript } from "../models/transcript.models.js";
import { Patient } from "../models/patient.models.js";
import { Consultation } from "../models/consultation.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─── Start a new transcript session when call begins ───
export const startTranscript = asyncHandler(async (req, res) => {
    const { patientId, callMode = "video", language = "en-IN" } = req.body;

    if (!patientId) {
        throw new ApiError(400, "Patient ID is required to start transcription.");
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
        throw new ApiError(404, "Patient not found.");
    }

    const transcript = await Transcript.create({
        patient: patientId,
        doctor: req.user?._id,
        callMode,
        language,
        status: "active",
        entries: [
            {
                speaker: "system",
                speakerName: "Setu AI",
                text: `Transcription session started. Mode: ${callMode.toUpperCase()}. Language: ${language}.`,
                confidence: 1.0,
            },
        ],
    });

    return res.status(201).json(
        new ApiResponse(201, transcript, "Transcription session started")
    );
});

// ─── Append a transcript entry (real-time, called per utterance) ───
export const appendEntry = asyncHandler(async (req, res) => {
    const { transcriptId } = req.params;
    const { speaker = "patient", speakerName, text, confidence = 0.9 } = req.body;

    if (!text || text.trim() === "") {
        throw new ApiError(400, "Transcript text cannot be empty.");
    }

    const transcript = await Transcript.findById(transcriptId);
    if (!transcript) {
        throw new ApiError(404, "Transcript session not found.");
    }

    if (transcript.status === "completed") {
        throw new ApiError(400, "Cannot append to a completed transcript.");
    }

    transcript.entries.push({
        speaker,
        speakerName: speakerName || (speaker === "doctor" ? req.user?.name : "Patient"),
        text: text.trim(),
        confidence,
        timestamp: new Date(),
    });

    await transcript.save();

    // Emit real-time update via Socket.IO
    const io = req.app.get("io");
    if (io) {
        io.emit(`transcript:${transcriptId}`, {
            type: "entry",
            entry: transcript.entries[transcript.entries.length - 1],
        });
    }

    return res.status(200).json(
        new ApiResponse(200, transcript.entries[transcript.entries.length - 1], "Entry appended")
    );
});

// ─── Finalize transcript — link to consultation, generate AI summary ───
export const finalizeTranscript = asyncHandler(async (req, res) => {
    const { transcriptId } = req.params;
    const { consultationId, durationSeconds } = req.body;

    const transcript = await Transcript.findById(transcriptId);
    if (!transcript) {
        throw new ApiError(404, "Transcript session not found.");
    }

    // Add closing system entry
    transcript.entries.push({
        speaker: "system",
        speakerName: "Setu AI",
        text: "Transcription session ended. Generating summary...",
        confidence: 1.0,
    });

    transcript.status = "completed";
    transcript.durationSeconds = durationSeconds || 0;

    if (consultationId) {
        transcript.consultation = consultationId;
    }

    // Generate AI summary using Groq
    const conversationText = transcript.entries
        .filter((e) => e.speaker !== "system")
        .map((e) => `${e.speakerName} (${e.speaker}): ${e.text}`)
        .join("\n");

    try {
        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey && conversationText.length > 20) {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${groqKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are a clinical documentation assistant. Summarize the following doctor-patient teleconsultation transcript into a brief clinical summary (3-5 sentences). Focus on chief complaint, key findings discussed, diagnosis, and treatment plan. Use medical terminology where appropriate.",
                        },
                        {
                            role: "user",
                            content: `Summarize this teleconsultation transcript:\n\n${conversationText}`,
                        },
                    ],
                    temperature: 0.3,
                    max_tokens: 300,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                transcript.summary =
                    data.choices?.[0]?.message?.content || "Summary generation pending.";
            } else {
                transcript.summary = `Consultation with ${transcript.entries.length - 2} dialogue exchanges recorded.`;
            }
        } else {
            transcript.summary = `Consultation captured with ${transcript.entries.length - 2} dialogue entries.`;
        }
    } catch (err) {
        console.error("Groq summary error:", err.message);
        transcript.summary = `Consultation transcript recorded with ${transcript.entries.length} entries.`;
    }

    await transcript.save();

    const populated = await Transcript.findById(transcriptId)
        .populate("patient", "name abhaId age gender village")
        .populate("doctor", "name qualifications email")
        .populate("consultation");

    return res.status(200).json(
        new ApiResponse(200, populated, "Transcript finalized with AI summary")
    );
});

// ─── Get transcript by ID ───
export const getTranscriptById = asyncHandler(async (req, res) => {
    const { transcriptId } = req.params;

    const transcript = await Transcript.findById(transcriptId)
        .populate("patient", "name abhaId age gender village")
        .populate("doctor", "name qualifications email")
        .populate("consultation");

    if (!transcript) {
        throw new ApiError(404, "Transcript not found.");
    }

    return res.status(200).json(
        new ApiResponse(200, transcript, "Fetched transcript")
    );
});

// ─── Get transcripts for a consultation ───
export const getTranscriptByConsultation = asyncHandler(async (req, res) => {
    const { consultationId } = req.params;

    const transcript = await Transcript.findOne({ consultation: consultationId })
        .populate("patient", "name abhaId age gender village")
        .populate("doctor", "name qualifications email");

    if (!transcript) {
        throw new ApiError(404, "No transcript found for this consultation.");
    }

    return res.status(200).json(
        new ApiResponse(200, transcript, "Fetched consultation transcript")
    );
});

// ─── Get all transcripts for a patient ───
export const getPatientTranscripts = asyncHandler(async (req, res) => {
    const { patientId } = req.params;

    const transcripts = await Transcript.find({ patient: patientId })
        .populate("doctor", "name qualifications")
        .populate("consultation")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, transcripts, `Fetched ${transcripts.length} transcripts`)
    );
});
