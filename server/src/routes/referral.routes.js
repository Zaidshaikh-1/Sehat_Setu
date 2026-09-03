import { Router } from "express";
import {
  getAllReferrals,
  getReferralKanban,
  createReferral,
  updateReferralStatus,
  getReferralById,
} from "../controller/referral.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/", verifyJwt, getAllReferrals);
router.get("/kanban", verifyJwt, getReferralKanban);
router.post("/", verifyJwt, createReferral);
router.get("/:referralId", verifyJwt, getReferralById);
router.patch("/:referralId/status", verifyJwt, updateReferralStatus);

export default router;
