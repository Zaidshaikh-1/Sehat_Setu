import { Router } from "express";
import {
  getDiagnostics,
  updateEquipmentStatus,
  orderTest,
} from "../controller/diagnostic.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/", verifyJwt, getDiagnostics);
router.patch("/:diagnosticId/equipment-status", verifyJwt, updateEquipmentStatus);
router.post("/order", verifyJwt, orderTest);

export default router;
