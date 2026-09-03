import { Router } from "express";
import { getDistrictMetrics, getFacilities } from "../controller/dashboard.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/metrics", verifyJwt, getDistrictMetrics);
router.get("/facilities", verifyJwt, getFacilities);

export default router;
