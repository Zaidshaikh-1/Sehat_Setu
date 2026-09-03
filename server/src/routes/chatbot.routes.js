import { Router } from "express";
import { chatWithAssistant, getSuggestedPrompts } from "../controller/chatbot.controller.js";

const router = Router();

// POST /api/chatbot/chat — Send message and get AI response
router.post("/chat", chatWithAssistant);

// GET /api/chatbot/prompts — Get suggested quick prompts
router.get("/prompts", getSuggestedPrompts);

export default router;
