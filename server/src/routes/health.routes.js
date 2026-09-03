import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    platform: "Setu - Integrated Rural Care-Access & Quality Platform",
    timestamp: new Date().toISOString(),
    abdmMockServer: "active",
  });
});

export default router;
