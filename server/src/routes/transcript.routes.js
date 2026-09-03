import { Router } from "express";
import {
    startTranscript,
    appendEntry,
    finalizeTranscript,
    getTranscriptById,
    getTranscriptByConsultation,
    getPatientTranscripts,
} from "../controller/transcript.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.post("/start", verifyJwt, startTranscript);
router.post("/:transcriptId/append", verifyJwt, appendEntry);
router.patch("/:transcriptId/finalize", verifyJwt, finalizeTranscript);
router.get("/consultation/:consultationId", verifyJwt, getTranscriptByConsultation);
router.get("/patient/:patientId", verifyJwt, getPatientTranscripts);
router.get("/:transcriptId", verifyJwt, getTranscriptById);

export default router;
