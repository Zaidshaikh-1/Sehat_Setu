import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        process.env.CORS,
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for hackathon testing
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Route imports
import authRoutes from "./routes/auth.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import triageRoutes from "./routes/triage.routes.js";
import consultationRoutes from "./routes/consultation.routes.js";
import referralRoutes from "./routes/referral.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import diagnosticRoutes from "./routes/diagnostic.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import followupRoutes from "./routes/followup.routes.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import bloodbankRoutes from "./routes/bloodbank.routes.js";
import healthRoutes from "./routes/health.routes.js";
import transcriptRoutes from "./routes/transcript.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import symptomAnalysisRoutes from "./routes/symptomAnalysis.routes.js";

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/triage", triageRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/diagnostics", diagnosticRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/symptom-analysis", symptomAnalysisRoutes);

app.use("/api/bloodbank", bloodbankRoutes);
app.use("/health", healthRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    statusCode,
    success: false,
    message: err.message || "Internal Server Error",
    error: err.error || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
