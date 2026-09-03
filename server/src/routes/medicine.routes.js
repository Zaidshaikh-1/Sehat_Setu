import { Router } from "express";
import {
  getMedicines,
  updateMedicineStock,
  getStockOutAlerts,
} from "../controller/medicine.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/", verifyJwt, getMedicines);
router.get("/alerts", verifyJwt, getStockOutAlerts);
router.patch("/:medicineId/stock", verifyJwt, updateMedicineStock);

export default router;
