import { Router } from "express";
import {
  getAshaWorklist,
  getAllFollowups,
  createFollowup,
  completeFollowup,
} from "../controller/followup.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/worklist", verifyJwt, getAshaWorklist);
router.get("/", verifyJwt, getAllFollowups);
router.post("/", verifyJwt, createFollowup);
router.patch("/:followupId/complete", verifyJwt, completeFollowup);

export default router;
