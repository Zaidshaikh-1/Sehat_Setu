import { Router } from "express";
import {
  getAppointments,
  bookAppointment,
  updateAppointmentStatus,
} from "../controller/appointment.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/", verifyJwt, getAppointments);
router.post("/book", verifyJwt, bookAppointment);
router.patch("/:appointmentId/status", verifyJwt, updateAppointmentStatus);

export default router;
