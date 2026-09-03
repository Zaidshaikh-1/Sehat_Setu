import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const SPECIALIST_SYSTEM_PROMPT = `You are the AI Clinical Triage & Specialist Matcher for Sehat Setu — an Indian rural health network.
Your job is to analyze patient symptoms and match them to the most suitable medical specialty from this exact list:
1. "General Physician" (fever, weakness, infection, common cold, diabetes, hypertension, general fatigue)
2. "Gynecologist/Obstetrician" (pregnancy, maternal discomfort, menstrual issues, pelvic pain, prenatal checkup)
3. "Pediatrician" (infant illness, child fever, pediatric cough, newborn rashes, childhood growth issues)
4. "Dermatologist" (skin rash, fungal infections, itching, hives, boils, eczema, skin discoloration)
5. "Orthopedic Surgeon" (bone fracture, joint pain, backache, sprain, arthritis, difficulty walking)

Output ONLY valid JSON in this exact structure:
{
  "specialty": "General Physician" | "Gynecologist/Obstetrician" | "Pediatrician" | "Dermatologist" | "Orthopedic Surgeon",
  "urgency": "Routine" | "Priority" | "Emergency",
  "explanation": "2-3 sentences explaining the clinical assessment and why this specialist is recommended in simple, compassionate language (support Hindi or Marathi if the user query was in Hindi/Marathi).",
  "recommendedAction": "Immediate advice or first-aid step (e.g. hydrate with ORS, keep limb immobilized, monitor fever)."
}
Do not wrap your output in markdown code blocks if possible, or provide raw parseable JSON.`;

function getRuleBasedAnalysis(name, age, gender, symptoms, language) {
    const text = (symptoms || "").toLowerCase();
    let specialty = "General Physician";
    let urgency = "Routine";
    let explanation = "Based on the reported symptoms, a General Physician will conduct a full clinical examination and prescribe the necessary treatment.";
    let recommendedAction = "Stay hydrated and rest comfortably until your teleconsultation.";

    if (text.includes("pregnant") || text.includes("pregnancy") || text.includes("garbh") || text.includes("cramp") || text.includes("maternal") || text.includes("period") || text.includes("bleeding") || text.includes("uterus") || text.includes("vagina") || text.includes("nausea")) {
        specialty = "Gynecologist/Obstetrician";
        urgency = "Priority";
        explanation = language === "hi"
            ? "आपके लक्षण मातृ एवं महिला स्वास्थ्य से संबंधित हैं। इसके लिए स्त्री एवं प्रसूति रोग विशेषज्ञ (OB-GYN) से तुरंत परामर्श आवश्यक है।"
            : language === "mr"
            ? "तुमची लक्षणे महिला व माता आरोग्याशी संबंधित आहेत. यासाठी स्त्रीरोग व प्रसूतीतज्ज्ञ (OB-GYN) डॉक्टरांचा सल्ला घेणे आवश्यक आहे."
            : "Your symptoms require specialized maternal and reproductive health care from an OB-GYN specialist.";
        recommendedAction = language === "hi"
            ? "भारी वजन न उठाएं और डॉक्टर के परामर्श तक आराम करें।"
            : language === "mr"
            ? "जड कामे टाळा आणि डॉक्टरांशी संपर्क होईपर्यंत विश्रांती घ्या."
            : "Avoid heavy physical exertion and monitor vital signs like blood pressure.";
    } else if (text.includes("child") || text.includes("baby") || text.includes("infant") || text.includes("baccha") || text.includes("balak") || text.includes("khokla") || text.includes("cough") || (age && Number(age) < 14)) {
        specialty = "Pediatrician";
        urgency = "Priority";
        explanation = language === "hi"
            ? "बच्चे के लक्षणों के लिए बाल रोग विशेषज्ञ (Pediatrician) से जांच कराना आवश्यक है।"
            : language === "mr"
            ? "लहान मुलांच्या आरोग्यासाठी बालरोगतज्ज्ञ (Pediatrician) डॉक्टरांचा सल्ला घेणे योग्य राहील."
            : "Pediatric care is recommended to evaluate symptoms specific to infants and growing children.";
        recommendedAction = "Keep the child warm, well-hydrated, and closely monitor temperature.";
    } else if (text.includes("skin") || text.includes("rash") || text.includes("itch") || text.includes("khujli") || text.includes("twacha") || text.includes("purad") || text.includes("boil") || text.includes("fungal")) {
        specialty = "Dermatologist";
        urgency = "Routine";
        explanation = language === "hi"
            ? "त्वचा संबंधी समस्या और संक्रमण की जांच के लिए त्वचा रोग विशेषज्ञ (Dermatologist) से परामर्श करें।"
            : language === "mr"
            ? "त्वचेचे विकार आणि संसर्ग तपासण्यासाठी त्वचाविकारतज्ज्ञ (Dermatologist) डॉक्टरांचा सल्ला घ्या."
            : "A dermatologist will examine the skin presentation to diagnose infections or allergic reactions.";
        recommendedAction = "Avoid scratching or touching the affected area and keep it clean and dry.";
    } else if (text.includes("bone") || text.includes("fracture") || text.includes("joint") || text.includes("knee") || text.includes("haddi") || text.includes("had") || text.includes("sprain") || text.includes("back") || text.includes("waist") || text.includes("kamar")) {
        specialty = "Orthopedic Surgeon";
        urgency = "Priority";
        explanation = language === "hi"
            ? "हड्डी और जोड़ों के दर्द के लिए अस्थि रोग विशेषज्ञ (Orthopedic Surgeon) से परामर्श आवश्यक है।"
            : language === "mr"
            ? "हाडे व सांधेदुखीच्या त्रासासाठी अस्थिरोगतज्ज्ञ (Orthopedic Surgeon) डॉक्टरांचा सल्ला आवश्यक आहे."
            : "Musculoskeletal symptoms indicate joint or bone stress requiring orthopedic evaluation.";
        recommendedAction = "Immobilize the affected area, avoid putting body weight on it, and rest.";
    }

    return {
        specialty,
        urgency,
        explanation,
        recommendedAction,
        patient: { name: name || "Anonymous", age, gender }
    };
}

export const analyzeSymptoms = asyncHandler(async (req, res) => {
    const { name, age, gender, symptoms, language = "en" } = req.body;

    if (!symptoms || symptoms.trim() === "") {
        throw new ApiError(400, "Please provide symptoms to analyze.");
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
        const result = getRuleBasedAnalysis(name, age, gender, symptoms, language);
        return res.status(200).json(
            new ApiResponse(200, result, "Symptom analysis completed")
        );
    }

    try {
        const prompt = `Patient Details: Name: ${name || "Unknown"}, Age: ${age || "N/A"}, Gender: ${gender || "N/A"}, Preferred Language: ${language}
Symptoms: "${symptoms}"

Analyze the symptoms and return the structured JSON with specialty selection. If language is Hindi or Marathi, provide the explanation and recommendedAction in that language.`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${groqKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: SPECIALIST_SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ],
                temperature: 0.2,
                max_tokens: 500,
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API responded with status ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        const parsed = JSON.parse(content);

        return res.status(200).json(
            new ApiResponse(200, {
                ...parsed,
                patient: { name: name || "Anonymous", age, gender }
            }, "Symptom analysis completed")
        );
    } catch (err) {
        console.error("AI Symptom Analysis Error:", err.message);
        const fallback = getRuleBasedAnalysis(name, age, gender, symptoms, language);
        return res.status(200).json(
            new ApiResponse(200, fallback, "Symptom analysis completed")
        );
    }
});
