import { Router } from "express";
import {
  createConsultation,
  getConsultationById,
  getPatientConsultations,
} from "../controller/consultation.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.post("/", verifyJwt, createConsultation);
router.get("/patient/:patientId", verifyJwt, getPatientConsultations);
router.get("/:consultationId", verifyJwt, getConsultationById);

export default router;
