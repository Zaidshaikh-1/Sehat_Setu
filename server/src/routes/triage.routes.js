import { Router } from "express";
import { submitTriage, getTriageHistory } from "../controller/triage.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.post("/evaluate", verifyJwt, submitTriage);
router.get("/patient/:patientId", verifyJwt, getTriageHistory);

export default router;
