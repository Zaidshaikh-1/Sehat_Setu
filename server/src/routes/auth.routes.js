import { Router } from "express";
import { login, quickDemoLogin, getCurrentUser, logout, getStaffList } from "../controller/auth.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.post("/login", login);
router.post("/demo-login", quickDemoLogin);
router.get("/me", verifyJwt, getCurrentUser);
router.post("/logout", verifyJwt, logout);
router.get("/staff", verifyJwt, getStaffList);

export default router;
