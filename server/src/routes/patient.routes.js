import { Router } from "express";
import {
  getAllPatients,
  getPatientById,
  getPatientTimeline,
  createPatient,
  searchByAbha,
} from "../controller/patient.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/", verifyJwt, getAllPatients);
router.post("/", verifyJwt, createPatient);
router.get("/abha/:abhaId", verifyJwt, searchByAbha);
router.get("/:patientId", verifyJwt, getPatientById);
router.get("/:patientId/timeline", verifyJwt, getPatientTimeline);

export default router;
