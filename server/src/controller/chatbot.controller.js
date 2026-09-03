import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const SYSTEM_PROMPT = `You are "Setu AI", an intelligent healthcare assistant built into the Sehat Setu platform — India's rural healthcare bridge.

Your primary users are ASHA (Accredited Social Health Activist) frontline workers, ANMs, and rural healthcare providers. You help them with:

1. **Clinical Guidance**: Symptoms, first-aid, when to escalate/refer, danger signs for maternal & child health, common rural diseases (malaria, dengue, TB, diarrhea, anemia, etc.)
2. **Government Schemes**: Janani Suraksha Yojana (JSY), Pradhan Mantri Matru Vandana Yojana (PMMVY), Ayushman Bharat, Rashtriya Bal Swasthya Karyakram (RBSK), immunization schedules (NIS), nutrition programs (ICDS/Poshan Abhiyaan).
3. **ASHA Protocols**: Home visit checklists, high-risk pregnancy identification, newborn care, HBNC (Home Based Newborn Care), HBYC (Home Based Young Child Care), incentive eligibility, reporting formats.
4. **Drug Information**: Common drug dosages (ORS, IFA tablets, Misoprostol, Chloroquine, Paracetamol, Amoxicillin), contraindications, and storage.
5. **Platform Help**: How to use Sehat Setu features — triage, referrals, teleconsultation, patient records, follow-up worklist, emergency SOS.

Guidelines:
- Keep answers concise, practical, and action-oriented.
- Use simple language. Avoid complex medical jargon unless the user specifically asks.
- When discussing danger signs, always emphasize the need for immediate referral.
- If you're unsure, recommend consulting a doctor via the Teleconsult feature.
- Support both English and Hindi queries — respond in the same language the user writes in.
- Format responses with bullet points and bold headers for easy scanning.
- Never diagnose — guide the ASHA worker on what steps to take and when to escalate.`;

// ─── Chat with AI Assistant ───
export const chatWithAssistant = asyncHandler(async (req, res) => {
    const { message, history = [] } = req.body;

    if (!message || message.trim() === "") {
        throw new ApiError(400, "Message cannot be empty.");
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
        throw new ApiError(500, "AI service is not configured. Please contact admin.");
    }

    // Build conversation messages array
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation history (last 20 messages max to stay within token limits)
    const recentHistory = history.slice(-20);
    for (const entry of recentHistory) {
        messages.push({
            role: entry.role === "user" ? "user" : "assistant",
            content: entry.content,
        });
    }

    // Add the current user message
    messages.push({ role: "user", content: message.trim() });

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${groqKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages,
                temperature: 0.5,
                max_tokens: 800,
                top_p: 0.9,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Groq API Error:", response.status, errorData);
            throw new ApiError(502, "AI service temporarily unavailable. Please try again.");
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";

        return res.status(200).json(
            new ApiResponse(200, {
                reply,
                tokensUsed: data.usage?.total_tokens || 0,
            }, "AI response generated")
        );
    } catch (err) {
        if (err instanceof ApiError) throw err;
        console.error("Chatbot error:", err.message);
        throw new ApiError(502, "Failed to get AI response. Please try again shortly.");
    }
});

// ─── Get suggested quick prompts ───
export const getSuggestedPrompts = asyncHandler(async (req, res) => {
    const prompts = [
        { category: "Maternal Health", text: "What are the danger signs during pregnancy?", icon: "🤰" },
        { category: "Newborn Care", text: "HBNC visit schedule for newborns?", icon: "👶" },
        { category: "Immunization", text: "National Immunization Schedule for children", icon: "💉" },
        { category: "Common Illness", text: "ORS preparation and dosage for diarrhea?", icon: "💊" },
        { category: "Government Scheme", text: "How does Janani Suraksha Yojana work?", icon: "🏥" },
        { category: "Emergency", text: "When should I call 108 for emergency referral?", icon: "🚑" },
        { category: "Platform Help", text: "How to create a new triage in Sehat Setu?", icon: "📋" },
        { category: "Anemia", text: "IFA tablet dosage and compliance tips", icon: "🩸" },
    ];

    return res.status(200).json(
        new ApiResponse(200, prompts, "Suggested prompts retrieved")
    );
});
