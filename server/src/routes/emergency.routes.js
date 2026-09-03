import { Router } from "express";
import { triggerSOS, getActiveEmergencies } from "../controller/emergency.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.post("/sos", verifyJwt, triggerSOS);
router.get("/active", verifyJwt, getActiveEmergencies);

export default router;
