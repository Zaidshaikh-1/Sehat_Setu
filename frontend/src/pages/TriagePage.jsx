import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { api } from "../utils/api.js";
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  Stethoscope,
  Volume2,
  Share2,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const CATEGORY_SYMPTOMS = {
  Maternal: [
    "Per-vaginal bleeding or spotting",
    "Severe headache with blurred vision",
    "Reduced or absent fetal movements",
    "Severe pedal edema (swollen feet)",
    "Convulsions or fits in pregnancy",
    "High fever with chills in pregnancy",
    "Acute lower abdominal pain",
  ],
  "Child Health": [
    "Unable to breastfeed or drink",
    "Vomits everything ingested",
    "Chest indrawing or rapid breathing",
    "Lethargy or unconsciousness",
    "Severe watery diarrhea with sunken eyes",
    "High fever over 103 F in infant",
    "Stridor or wheezing in child",
  ],
  "NCD / Cardiac": [
    "Crushing chest pain radiating to left arm",
    "Sudden facial droop or slurred speech",
    "Sudden one-sided arm or leg weakness",
    "Severe shortness of breath at rest",
    "Persistent dizziness or fainting spells",
    "Uncontrolled blood sugar over 300 mg/dL",
  ],
  Respiratory: [
    "Productive cough over 2 weeks (Suspected TB)",
    "Hemoptysis (Blood in sputum)",
    "Severe breathlessness (SpO2 under 94%)",
    "Fever with chills and chest congestion",
    "Wheezing or asthma exacerbation",
  ],
  Gastrointestinal: [
    "Acute watery diarrhea over 5 times a day",
    "Severe abdominal tenderness or guarding",
    "Persistent vomiting with dry mouth",
    "Blood in stool or black tarry stool",
  ],
  "General / Fever": [
    "Fever over 5 days duration",
    "High grade fever with shivering",
    "Mild seasonal cold and runny nose",
    "General body ache and fatigue",
    "Mild skin rash without fever",
  ],
};

export function TriagePage() {
  const { patientId } = useParams();
  const { patients, activePatient, setActivePatient } = useOutletContext();
  const navigate = useNavigate();

  const [selectedPatientId, setSelectedPatientId] = useState(patientId || activePatient?._id || "");
  const [category, setCategory] = useState("Maternal");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [severity, setSeverity] = useState("moderate");
  const [duration, setDuration] = useState("1-2 days");
  const [vitals, setVitals] = useState({
    systolicBP: "",
    diastolicBP: "",
    spO2: "",
    pulseRate: "",
    temperature: "",
    bloodSugar: "",
  });
  const [notes, setNotes] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (patientId) {
      setSelectedPatientId(patientId);
      const found = patients?.find((p) => p._id === patientId);
      if (found) {
        setActivePatient(found);
        if (found.isPregnant) setCategory("Maternal");
        else if (found.age <= 5) setCategory("Child Health");
        else if (found.conditions?.some((c) => c.toLowerCase().includes("hypertension"))) setCategory("NCD / Cardiac");
      }
    }
  }, [patientId, patients]);

  const currentPatient = patients?.find((p) => p._id === selectedPatientId) || activePatient || patients?.[0];

  const handleToggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleRunTriage = async (e) => {
    e.preventDefault();
    if (!selectedPatientId && !currentPatient?._id) {
      alert("Please select a patient first.");
      return;
    }

    setEvaluating(true);
    try {
      const cleanVitals = {};
      if (vitals.systolicBP) cleanVitals.systolicBP = Number(vitals.systolicBP);
      if (vitals.diastolicBP) cleanVitals.diastolicBP = Number(vitals.diastolicBP);
      if (vitals.spO2) cleanVitals.spO2 = Number(vitals.spO2);
      if (vitals.pulseRate) cleanVitals.pulseRate = Number(vitals.pulseRate);
      if (vitals.temperature) cleanVitals.temperature = Number(vitals.temperature);
      if (vitals.bloodSugar) cleanVitals.bloodSugar = Number(vitals.bloodSugar);

      const payload = {
        patientId: selectedPatientId || currentPatient._id,
        category,
        symptoms: selectedSymptoms.map((name) => ({ name, severity, duration })),
        vitals: cleanVitals,
        notes,
      };

      const res = await api.post("/triage/evaluate", payload);
      setTriageResult(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Triage evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  const handleSpeakReadback = () => {
    if (!triageResult?.evaluation) return;
    setSpeaking(true);
    const text = `Triage Risk Assessment: Tier is ${triageResult.evaluation.riskTier}. ${triageResult.evaluation.recommendation}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case "emergency":
        return "bg-rose-600 text-white font-bold";
      case "urgent-referral":
        return "bg-amber-600 text-white font-bold";
      case "visit-phc":
        return "bg-teal-700 text-white font-bold";
      case "self-care":
      default:
        return "bg-emerald-600 text-white font-bold";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto text-left font-sans text-slate-800">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Module 3.1 · Decision Engine
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Frontline Clinical Triage & Risk Stratification
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Evaluates rural presentations, danger red flags, and maternal-child emergencies.
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex flex-col gap-1 w-full sm:w-64 shrink-0">
          <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Target Patient</label>
          <select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              const p = patients?.find((item) => item._id === e.target.value);
              if (p) setActivePatient(p);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600"
          >
            {patients?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.village} · {p.age}y)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Form + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
          {/* Patient Card Context */}
          {currentPatient && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{currentPatient.name}</span>
                <span className="text-[11px] text-teal-800 font-mono">
                  ABHA: {currentPatient.abhaId} · {currentPatient.village}
                </span>
              </div>
              <div className="text-right text-[11px]">
                <span className="text-slate-500">{currentPatient.age} yrs ({currentPatient.gender})</span>
                {currentPatient.isPregnant && (
                  <span className="block font-bold text-amber-700">ANC {currentPatient.gestationalWeeks}w</span>
                )}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">1. Clinical Presentation Category</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(CATEGORY_SYMPTOMS).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setSelectedSymptoms([]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    category === cat
                      ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>2. Observed Symptoms & Danger Signs</span>
              <span className="text-[10px] font-mono text-slate-500">({selectedSymptoms.length} selected)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORY_SYMPTOMS[category]?.map((symptom, i) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <div
                    key={i}
                    onClick={() => handleToggleSymptom(symptom)}
                    className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-start gap-2 select-none ${
                      isSelected
                        ? "bg-teal-50 border-teal-600 text-teal-950 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-teal-600 pointer-events-none"
                    />
                    <span className="leading-tight">{symptom}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vitals Input Row */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700">3. Physical Vitals Readings</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Sys BP</span>
                <input
                  type="number"
                  placeholder="120"
                  value={vitals.systolicBP}
                  onChange={(e) => setVitals({ ...vitals, systolicBP: e.target.value })}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Dia BP</span>
                <input
                  type="number"
                  placeholder="80"
                  value={vitals.diastolicBP}
                  onChange={(e) => setVitals({ ...vitals, diastolicBP: e.target.value })}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase">SpO2 %</span>
                <input
                  type="number"
                  placeholder="98"
                  value={vitals.spO2}
                  onChange={(e) => setVitals({ ...vitals, spO2: e.target.value })}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Pulse</span>
                <input
                  type="number"
                  placeholder="76"
                  value={vitals.pulseRate}
                  onChange={(e) => setVitals({ ...vitals, pulseRate: e.target.value })}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Temp F</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Sugar</span>
                <input
                  type="number"
                  placeholder="110"
                  value={vitals.bloodSugar}
                  onChange={(e) => setVitals({ ...vitals, bloodSugar: e.target.value })}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">4. Field Observations & Notes</label>
            <textarea
              rows="2"
              placeholder="Enter specific patient statements or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-600 font-sans"
            />
          </div>

          <button
            onClick={handleRunTriage}
            disabled={evaluating}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            <Activity className="w-4 h-4" />
            <span>{evaluating ? "Evaluating Decision Tree..." : "Evaluate Risk & Save to Record"}</span>
          </button>
        </div>

        {/* Right Result Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {triageResult ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5 text-left keep-note animate-fadeIn">
              {/* Top Result Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className={`px-3 py-1 rounded-lg text-xs uppercase tracking-wider ${getTierBadge(triageResult.evaluation.riskTier)}`}>
                  TIER: {triageResult.evaluation.riskTier}
                </span>
                <button
                  onClick={handleSpeakReadback}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer border-none"
                >
                  <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{speaking ? "Playing..." : "Audio Readback"}</span>
                </button>
              </div>

              {/* Red Flags Alert Box */}
              {triageResult.evaluation.redFlags?.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Danger Signs Detected:</span>
                  </div>
                  <ul className="list-disc pl-5 m-0 text-xs text-rose-700 flex flex-col gap-0.5">
                    {triageResult.evaluation.redFlags.map((flag, idx) => (
                      <li key={idx} className="font-semibold">{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation Content */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Clinical Recommendation</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {triageResult.evaluation.recommendation}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Required Action</span>
                <p className="text-xs text-teal-900 font-bold bg-teal-50 p-3 rounded-xl border border-teal-200">
                  {triageResult.evaluation.actionRequired}
                </p>
              </div>

              {/* Next Steps Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => navigate(`/consultation/${currentPatient._id}`)}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Start Assisted Teleconsultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate(`/referrals`)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Inspect Referral on Live Kanban</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3 min-h-[360px] text-slate-400">
              <Activity className="w-8 h-8 text-slate-300" />
              <div className="flex flex-col gap-1 max-w-xs">
                <h4 className="text-sm font-bold text-slate-700">Triage Decision Output</h4>
                <p className="text-xs text-slate-500">
                  Select observed symptoms and evaluate to calculate risk tier and trigger auto-referrals.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
