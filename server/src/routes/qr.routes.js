import { Router } from "express";
import {
  generateQrCode,
  getReferralScanStatus,
  scanAndAdvanceStatus,
} from "../controller/qr.controller.js";

const router = Router();

// Publicly accessible for QR code scanning from any device/camera
router.get("/scan-status/:referralId", getReferralScanStatus);
router.post("/scan/:referralId", scanAndAdvanceStatus);

// Generate QR code (can be called with or without auth token)
router.get("/:referralId", generateQrCode);

export default router;
