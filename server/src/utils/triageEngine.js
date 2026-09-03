/**
 * Rule-Based Clinical Triage & Risk Stratification Engine
 * Tuned specifically for rural Indian primary care & frontline ASHA/ANM presentations.
 */

export function evaluateTriage({
  category = "General",
  symptoms = [],
  vitals = {},
  isPregnant = false,
  isChild = false,
  notes = ""
}) {
  const redFlags = [];
  let riskTier = "self-care";
  let recommendation = "";
  let actionRequired = "";

  const symptomList = symptoms.map((s) => (typeof s === "string" ? s.toLowerCase() : (s.name || "").toLowerCase()));
  const fullText = (symptomList.join(" ") + " " + notes).toLowerCase();

  // 1. Maternal Obstetric Danger Signs (Immediate Emergency)
  if (isPregnant || category === "Maternal") {
    if (
      fullText.includes("bleeding") ||
      fullText.includes("per-vaginal bleeding") ||
      fullText.includes("spotting severe")
    ) {
      redFlags.push("Antepartum/Postpartum Hemorrhage Danger");
      riskTier = "emergency";
    }
    if (
      fullText.includes("convulsion") ||
      fullText.includes("seizure") ||
      fullText.includes("fits") ||
      (fullText.includes("severe headache") && fullText.includes("blurred vision"))
    ) {
      redFlags.push("Suspected Eclampsia / Severe Pre-eclampsia");
      riskTier = "emergency";
    }
    if (fullText.includes("reduced fetal movement") || fullText.includes("no movement")) {
      redFlags.push("Fetal Distress / Decreased Fetal Movement");
      if (riskTier !== "emergency") riskTier = "urgent-referral";
    }
    if (vitals.systolicBP && (vitals.systolicBP >= 160 || vitals.diastolicBP >= 110)) {
      redFlags.push("Severe Hypertensive Crisis in Pregnancy");
      riskTier = "emergency";
    } else if (vitals.systolicBP && (vitals.systolicBP >= 140 || vitals.diastolicBP >= 90)) {
      redFlags.push("Gestational Hypertension Warning");
      if (riskTier !== "emergency") riskTier = "urgent-referral";
    }
  }

  // 2. Child / Neonatal Danger Signs (IMNCI standard)
  if (isChild || category === "Child Health") {
    if (
      fullText.includes("unable to feed") ||
      fullText.includes("vomits everything") ||
      fullText.includes("unconscious") ||
      fullText.includes("lethargic") ||
      fullText.includes("convulsions")
    ) {
      redFlags.push("IMNCI General Danger Signs: Inability to feed / Convulsions / Lethargy");
      riskTier = "emergency";
    }
    if (fullText.includes("chest indrawing") || fullText.includes("stridor") || fullText.includes("grunting")) {
      redFlags.push("Severe Respiratory Distress / Pneumonia");
      riskTier = "emergency";
    }
    if (fullText.includes("severe diarrhea") && (fullText.includes("sunken eyes") || fullText.includes("skin pinch slow"))) {
      redFlags.push("Severe Dehydration in Pediatric Patient");
      riskTier = "emergency";
    }
  }

  // 3. Acute Cardiopulmonary / Stroke Emergencies
  if (
    fullText.includes("crushing chest pain") ||
    (fullText.includes("chest pain") && fullText.includes("radiating")) ||
    (fullText.includes("chest pain") && fullText.includes("sweating"))
  ) {
    redFlags.push("Suspected Acute Coronary Syndrome (Heart Attack)");
    riskTier = "emergency";
  }
  if (
    fullText.includes("facial droop") ||
    fullText.includes("slurred speech") ||
    fullText.includes("one-sided weakness") ||
    fullText.includes("hemiplegia")
  ) {
    redFlags.push("Suspected Acute Stroke (FAST Positive)");
    riskTier = "emergency";
  }
  if (vitals.spO2 && vitals.spO2 < 90) {
    redFlags.push(`Severe Hypoxemia (SpO2: ${vitals.spO2}%)`);
    riskTier = "emergency";
  } else if (vitals.spO2 && vitals.spO2 < 94) {
    redFlags.push(`Moderate Hypoxemia (SpO2: ${vitals.spO2}%)`);
    if (riskTier !== "emergency") riskTier = "urgent-referral";
  }

  // 4. Infectious & Endemic Rural Red Flags (Prolonged fever, TB, Malaria, Severe Sepsis)
  if (
    fullText.includes("fever > 5 days") ||
    fullText.includes("fever with chills") ||
    fullText.includes("cough > 2 weeks") ||
    fullText.includes("hemoptysis") ||
    fullText.includes("blood in sputum") ||
    fullText.includes("black stool")
  ) {
    if (riskTier === "self-care" || riskTier === "visit-phc") {
      riskTier = "urgent-referral";
      redFlags.push("Prolonged Fever / Suspected TB / Severe Sepsis or Bleeding");
    }
  }

  // 5. Moderate Rural Common Presentations
  if (riskTier === "self-care") {
    if (
      fullText.includes("fever") ||
      fullText.includes("diarrhea") ||
      fullText.includes("vomiting") ||
      fullText.includes("cough") ||
      fullText.includes("joint pain") ||
      fullText.includes("skin rash") ||
      fullText.includes("hypertension") ||
      fullText.includes("diabetes") ||
      fullText.includes("urinary burning")
    ) {
      riskTier = "visit-phc";
    }
  }

  // Vitals threshold checks if provided
  if (vitals.temperature && vitals.temperature >= 103) {
    redFlags.push(`High Hyperpyrexia (Temp: ${vitals.temperature}°F)`);
    if (riskTier === "self-care") riskTier = "visit-phc";
  }

  // Set detailed recommendations based on finalized tier
  switch (riskTier) {
    case "emergency":
      recommendation = "IMMEDIATE EMERGENCY ESCALATION: Patient requires immediate stabilization and ambulance transport to the nearest CHC or District Hospital. Queue bypassed.";
      actionRequired = "Activate 108 Emergency Transport / Alert Medical Officer immediately.";
      break;
    case "urgent-referral":
      recommendation = "URGENT REFERRAL: Patient presents with significant danger signs. Initiate assisted teleconsultation with a PHC/CHC Medical Officer within 30 minutes or dispatch referral ticket.";
      actionRequired = "Schedule priority teleconsultation or issue direct CHC referral.";
      break;
    case "visit-phc":
      recommendation = "PHC CLINICAL VISIT: Symptoms warrant clinical evaluation by a Medical Officer. Book virtual queue token or transport patient to sub-centre/PHC during OPD hours.";
      actionRequired = "Generate PHC OPD token and medication checklist.";
      break;
    case "self-care":
    default:
      recommendation = "PRIMARY HOME CARE & MONITORING: Symptoms are manageable with supportive home care, hydration (ORS), and fever control. ASHA to follow up in 48 hours.";
      actionRequired = "Provide health literacy guidance and scheduled 48hr check-in.";
      break;
  }

  return {
    riskTier,
    redFlags,
    recommendation,
    actionRequired,
    autoReferral: riskTier === "emergency",
    evaluatedAt: new Date()
  };
}
