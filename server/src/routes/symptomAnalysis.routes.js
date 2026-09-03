import { Router } from "express";
import { analyzeSymptoms } from "../controller/symptomAnalysis.controller.js";

const router = Router();

router.route("/analyze").post(analyzeSymptoms);

export default router;
