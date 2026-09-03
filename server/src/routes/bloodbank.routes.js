import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import {
  getInventory,
  updateInventory,
  registerDonor,
  getDonors,
  createBloodRequest,
  getBloodRequests,
  fulfillBloodRequest,
  getDonationHistory,
  getCompatibility,
} from "../controller/bloodbank.controller.js";

const router = Router();

// Compatibility can be public
router.route("/compatibility").get(getCompatibility);
router.route("/compatibility/:bloodType").get(getCompatibility);

// Inventory routes (optionally authenticated)
router.route("/inventory").get(getInventory).patch(verifyJwt, updateInventory);

// Donors registry
router.route("/donors").get(getDonors).post(verifyJwt, registerDonor);

// Blood Requests
router.route("/requests").get(getBloodRequests).post(verifyJwt, createBloodRequest);
router.route("/requests/:id/fulfill").patch(verifyJwt, fulfillBloodRequest);

// Donation history
router.route("/history").get(getDonationHistory);

export default router;
