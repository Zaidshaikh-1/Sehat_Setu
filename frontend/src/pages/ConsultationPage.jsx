import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { api } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Stethoscope,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Plus,
  Trash2,
  Share2,
  CheckCircle2,
  HeartPulse,
  Activity,
  AlertCircle,
  FileText,
  ArrowRight,
  Sparkles,
  Radio,
  Volume2,
  Cpu,
  Loader2,
} from "lucide-react";

export function ConsultationPage() {
  const { patientId } = useParams();
  const { patients, activePatient, setActivePatient, refreshPatients } = useOutletContext();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [selectedPatientId, setSelectedPatientId] = useState(patientId || activePatient?._id || "");
  const [facilities, setFacilities] = useState([]);
  const [mode, setMode] = useState("video");
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Clinical Note State
  const [chiefComplaint, setChiefComplaint] = useState("Severe pedal edema and persistent headache in 28th week gestation");
  const [clinicalObservations, setClinicalObservations] = useState(
    "Assisted teleconsultation conducted with ASHA Meera present with patient. Mild pallor noted, bilateral pitting edema. Fetal heart rate regular at 142 bpm."
  );
  const [diagnosis, setDiagnosis] = useState("High-Risk Gestational Hypertension with Nutritional Anemia");
  const [advice, setAdvice] = useState(
    "Strict bed rest on left lateral position, reduce salt intake, continue IFA tablets, emergency hospital visit if bleeding occurs."
  );
  const [prescription, setPrescription] = useState([
    { medicine: "Tab. Ferrous Ascorbate 100mg + Folic Acid 1.5mg", dosage: "1 tablet", frequency: "Once daily (1-0-0)", duration: "30 days", instructions: "After meals" },
    { medicine: "Tab. Calcium Carbonate 500mg with Vit D3", dosage: "1 tablet", frequency: "Once daily (0-1-0)", duration: "30 days", instructions: "After lunch" },
  ]);

  const [referralNeeded, setReferralNeeded] = useState(true);
  const [referralDetails, setReferralDetails] = useState({
    toFacility: "",
    reason: "Obstetric Color Doppler USG & Specialist C-Section evaluation (Prev LSCS)",
    urgency: "urgent",
    department: "Obstetrics & Gynecology (Specialist OPD)",
    transportMode: "Public Bus",
  });

  const [saving, setSaving] = useState(false);
  const [completedResult, setCompletedResult] = useState(null);

  // Groq Transcription & AI Scribe State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptsList, setTranscriptsList] = useState([]);
  const [isParsingAi, setIsParsingAi] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadFacilities() {
      try {
        const res = await api.get("/dashboard/facilities");
        if (res.data?.data) {
          setFacilities(res.data.data);
          const dh = res.data.data.find((f) => f.tier === "district-hospital") || res.data.data[0];
          if (dh) {
            setReferralDetails((prev) => ({ ...prev, toFacility: dh._id }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadFacilities();

    return () => {
      stopRecording();
    };
  }, []);

  const currentPatient = patients?.find((p) => p._id === selectedPatientId) || activePatient || patients?.[0];

  // Start Real-time Mic Recording with 5-second chunk dispatcher
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      let chunks = [];

      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          const audioBlob = new Blob(chunks, { type: "audio/webm" });
          chunks = [];

          // Dispatch chunk to Groq Whisper
          if (audioBlob.size > 1000) {
            sendAudioChunkToGroq(audioBlob);
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Trigger data chunk every 5 seconds
      timerRef.current = setInterval(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.requestData();
        }
      }, 5000);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Microphone permission required for Groq AI transcription: " + err.message);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    setIsRecording(false);
  };

  const sendAudioChunkToGroq = async (blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "chunk.webm");

      const res = await api.post("/transcription/chunk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const text = res.data?.data?.text;
      if (text && text.trim().length > 0) {
        setTranscriptsList((prev) => [
          ...prev,
          {
            speaker: mode === "video" ? "Doctor / ASHA" : "Speaker",
            text: text.trim(),
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          },
        ]);
      }
    } catch (e) {
      console.error("Chunk transcription error:", e);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Full AI Clinical Note Synthesis via Groq LLaMA 3.3 70B
  const handleAutoFillWithGroq = async () => {
    const fullTranscriptText = transcriptsList.map((t) => `${t.speaker} [${t.time}]: ${t.text}`).join("\n");

    if (!fullTranscriptText.trim()) {
      alert("Please record some dialogue or speak into the microphone first to generate a transcript.");
      return;
    }

    setIsParsingAi(true);
    try {
      const res = await api.post("/transcription/parse", {
        transcript: fullTranscriptText,
        patientContext: {
          name: currentPatient?.name,
          age: currentPatient?.age,
          gender: currentPatient?.gender,
          village: currentPatient?.village,
          conditions: currentPatient?.conditions,
          vitals: currentPatient?.vitalsLatest,
        },
      });

      const parsed = res.data?.data?.structuredNote;
      if (parsed) {
        if (parsed.chiefComplaint) setChiefComplaint(parsed.chiefComplaint);
        if (parsed.clinicalObservations) setClinicalObservations(parsed.clinicalObservations);
        if (parsed.diagnosis) setDiagnosis(parsed.diagnosis);
        if (parsed.advice) setAdvice(parsed.advice);
        if (parsed.prescription && Array.isArray(parsed.prescription) && parsed.prescription.length > 0) {
          setPrescription(parsed.prescription);
        }
        if (parsed.referralNeeded !== undefined) {
          setReferralNeeded(parsed.referralNeeded);
          if (parsed.referralReason) {
            setReferralDetails((prev) => ({ ...prev, reason: parsed.referralReason }));
          }
        }

        setAiSuccessMsg("✨ AI synthesized clinical notes via Groq LLaMA 3.3 70B & Whisper Large v3!");
        setTimeout(() => setAiSuccessMsg(""), 6000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to parse transcript with AI");
    } finally {
      setIsParsingAi(false);
    }
  };

  const handleAddMedicine = () => {
    setPrescription([
      ...prescription,
      { medicine: "", dosage: "1 tablet", frequency: "Twice daily (1-0-1)", duration: "5 days", instructions: "After meals" },
    ]);
  };

  const handleUpdateMedicine = (index, field, value) => {
    const updated = [...prescription];
    updated[index][field] = value;
    setPrescription(updated);
  };

  const handleRemoveMedicine = (index) => {
    setPrescription(prescription.filter((_, i) => i !== index));
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!selectedPatientId && !currentPatient?._id) {
      alert("Please select a patient.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        patientId: selectedPatientId || currentPatient._id,
        mode,
        chiefComplaint,
        clinicalObservations,
        diagnosis,
        advice,
        prescription: prescription.filter((p) => p.medicine.trim() !== ""),
        referralNeeded,
        referralDetails: referralNeeded ? referralDetails : {},
      };

      const res = await api.post("/consultations", payload);
      setCompletedResult(res.data.data);
      if (refreshPatients) await refreshPatients();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to finalize consultation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left font-sans text-slate-800">
      {/* Top Header */}
      <div className="bg-white p-7 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 block mb-1">
            Module 3.3 · Clinical Telemedicine & AI Scribe
          </span>
          <h2 className="text-3xl font-serif font-bold text-[#1f2229] tracking-tight">
            Assisted Clinical Teleconsultation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-sans">
            Medical Officer teleconsultation with real-time Groq Whisper transcription & LLaMA automated note synthesis.
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex flex-col gap-1 w-full sm:w-64 shrink-0">
          <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Consulting Patient</label>
          <select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              const p = patients?.find((item) => item._id === e.target.value);
              if (p) setActivePatient(p);
            }}
            className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-700"
          >
            {patients?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.bloodGroup || "O+"} · {p.village} · {p.age}y)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Success Notification */}
      {aiSuccessMsg && (
        <div className="p-4 bg-teal-50 border border-teal-300 text-teal-900 rounded-2xl flex items-center justify-between gap-2 text-xs font-bold animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{aiSuccessMsg}</span>
          </div>
          <span className="px-2 py-0.5 bg-teal-800 text-white rounded text-[10px] font-mono uppercase font-bold">
            Groq LLaMA 3.3 70B
          </span>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Feed & Real-time AI Transcription (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Video Stream Card */}
          <div className="bg-[#1f2229] border border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[340px] text-white">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-teal-950 border border-teal-700 text-teal-300 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span>WebRTC Stream Active</span>
              </span>

              <div className="flex bg-slate-800 rounded-xl p-0.5 text-[10px] font-mono">
                <button
                  onClick={() => setMode("video")}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer border-none ${
                    mode === "video" ? "bg-teal-700 text-white font-bold" : "bg-transparent text-slate-400"
                  }`}
                >
                  Video
                </button>
                <button
                  onClick={() => setMode("voice")}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer border-none ${
                    mode === "voice" ? "bg-teal-700 text-white font-bold" : "bg-transparent text-slate-400"
                  }`}
                >
                  Voice
                </button>
              </div>
            </div>

            <div className="my-auto flex flex-col items-center justify-center gap-3 py-6">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-teal-500/40 flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-teal-400" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-serif font-bold text-white">{currentPatient?.name || "Patient"}</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Assisted by ASHA Meera · Rampur Sub-Centre
                </p>
              </div>
            </div>

            {/* Vitals Strip */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
              <div>
                BP: <strong className="text-teal-300">{currentPatient?.vitalsLatest?.systolicBP ? `${currentPatient.vitalsLatest.systolicBP}/${currentPatient.vitalsLatest.diastolicBP}` : "134/86"}</strong>
              </div>
              <div>
                SpO2: <strong className="text-teal-300">{currentPatient?.vitalsLatest?.spO2 || 98}%</strong>
              </div>
              <div>
                Hb: <strong className="text-teal-300">{currentPatient?.vitalsLatest?.hemoglobin || 8.8} g/dL</strong>
              </div>
            </div>

            {/* Call Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all ${
                    isAudioMuted ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300"
                  }`}
                  title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all ${
                    isVideoMuted ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300"
                  }`}
                  title={isVideoMuted ? "Start Camera" : "Stop Camera"}
                >
                  {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>

              {/* Transcription Mic Toggle */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-3.5 py-1.5 rounded-xl font-bold font-mono text-xs flex items-center gap-2 cursor-pointer border-none transition-all shadow-xs ${
                  isRecording
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-teal-700 hover:bg-teal-600 text-white"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isRecording ? "Stop AI Mic" : "Start AI Mic"}</span>
              </button>
            </div>
          </div>

          {/* Groq Live Transcription Panel */}
          <div className="bg-[#1f2229] border border-slate-800 rounded-3xl p-5 text-white flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-400" />
                <span className="font-serif font-bold text-sm text-white">Live Groq AI Captions</span>
              </div>

              <div className="flex items-center gap-2">
                {isTranscribing && (
                  <span className="text-[10px] font-mono text-teal-400 animate-pulse flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Transcribing...
                  </span>
                )}
                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[9px] font-mono">
                  Whisper v3
                </span>
              </div>
            </div>

            {/* Captions Stream Area */}
            <div className="max-h-[160px] min-h-[100px] overflow-y-auto flex flex-col gap-2 p-2 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs font-sans no-scrollbar">
              {transcriptsList.length === 0 ? (
                <div className="my-auto py-4 text-center text-slate-500 font-mono text-[11px]">
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-1 text-teal-400">
                      <div className="flex gap-1 items-center h-4">
                        <div className="w-1 h-3 bg-teal-400 rounded-full animate-pulse" />
                        <div className="w-1 h-4 bg-teal-400 rounded-full animate-pulse delay-75" />
                        <div className="w-1 h-2 bg-teal-400 rounded-full animate-pulse delay-150" />
                      </div>
                      <span>Listening... Speak into the microphone.</span>
                    </div>
                  ) : (
                    "Click 'Start AI Mic' above to capture live speech & generate real-time captions."
                  )}
                </div>
              ) : (
                transcriptsList.map((t, idx) => (
                  <div key={idx} className="p-2 bg-slate-800/90 rounded-xl flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-teal-400">
                      <span>{t.speaker}</span>
                      <span className="text-slate-500">{t.time}</span>
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed">{t.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Auto-fill Action Button */}
            <button
              onClick={handleAutoFillWithGroq}
              disabled={isParsingAi || transcriptsList.length === 0}
              className="w-full py-2.5 bg-gradient-to-r from-teal-800 to-teal-900 hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-teal-700 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isParsingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Synthesizing with Groq LLaMA 3.3 70B...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Auto-Fill Clinical Notes from AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Clinical Note Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-7 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D3D4C0]/60">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#1f2229]">Clinical Consultation Note</h3>
              <span className="text-[10px] font-mono text-teal-800 uppercase font-semibold">
                Saves to ABHA Longitudinal Timeline
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">Doctor: {user?.name || "Dr. Prakash Sharma"}</span>
          </div>

          <form onSubmit={handleSaveConsultation} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">Chief Complaint</label>
              <input
                type="text"
                required
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl focus:outline-none focus:border-teal-700 font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">Physical Exam / Clinical Findings</label>
              <textarea
                rows="2"
                value={clinicalObservations}
                onChange={(e) => setClinicalObservations(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl focus:outline-none focus:border-teal-700 font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">Clinical Diagnosis *</label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl focus:outline-none focus:border-teal-700 font-bold text-slate-900 font-sans"
              />
            </div>

            {/* Prescription Builder */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#D3D4C0]/60">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Medication Regimen (E-Prescription)</label>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medication</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {prescription.map((med, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#D3D4C0] flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Medicine name (e.g. Tab. Ferrous Ascorbate 100mg)"
                        value={med.medicine}
                        onChange={(e) => handleUpdateMedicine(idx, "medicine", e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-[#D3D4C0] rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer bg-transparent border-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <input
                        type="text"
                        placeholder="Frequency (1-0-1)"
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(idx, "frequency", e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-[#D3D4C0] rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Duration (5 days)"
                        value={med.duration}
                        onChange={(e) => handleUpdateMedicine(idx, "duration", e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-[#D3D4C0] rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Instructions"
                        value={med.instructions}
                        onChange={(e) => handleUpdateMedicine(idx, "instructions", e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-[#D3D4C0] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Downstream Referral Box */}
            <div className="p-4 bg-[#FAF7F2] border border-[#D3D4C0] rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="referralNeededCheck"
                    checked={referralNeeded}
                    onChange={(e) => setReferralNeeded(e.target.checked)}
                    className="w-4 h-4 text-teal-800 rounded"
                  />
                  <label htmlFor="referralNeededCheck" className="font-bold text-slate-800 text-xs cursor-pointer select-none">
                    Issue Downstream Closed-Loop Referral Ticket
                  </label>
                </div>
                <span className="text-[10px] font-mono text-teal-800 font-bold uppercase">Tracks on Kanban</span>
              </div>

              {referralNeeded && (
                <div className="flex flex-col gap-2 pt-2 border-t border-[#D3D4C0]/60">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-bold text-slate-700">Destination Facility</label>
                      <select
                        value={referralDetails.toFacility}
                        onChange={(e) => setReferralDetails({ ...referralDetails, toFacility: e.target.value })}
                        className="px-3 py-2 bg-white border border-[#D3D4C0] rounded-xl text-xs"
                      >
                        {facilities.map((f) => (
                          <option key={f._id} value={f._id}>
                            {f.name} ({f.tier})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-bold text-slate-700">Urgency Tier</label>
                      <select
                        value={referralDetails.urgency}
                        onChange={(e) => setReferralDetails({ ...referralDetails, urgency: e.target.value })}
                        className="px-3 py-2 bg-white border border-[#D3D4C0] rounded-xl text-xs"
                      >
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="emergency">Emergency (Ambulance 108)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-slate-700">Clinical Reason</label>
                    <input
                      type="text"
                      value={referralDetails.reason}
                      onChange={(e) => setReferralDetails({ ...referralDetails, reason: e.target.value })}
                      className="px-3 py-2 bg-white border border-[#D3D4C0] rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">Patient & ASHA Instructions</label>
              <textarea
                rows="2"
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl focus:outline-none focus:border-teal-700 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-[#1f2229] hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? "Finalizing Note & Dispatching..." : "Finalize Consultation & Sync to ABHA"}</span>
              <span className="text-xs text-teal-400">✦</span>
            </button>
          </form>

          {completedResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col gap-2 text-left keep-note animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Consultation saved to ABHA Longitudinal Timeline!</span>
              </div>
              {completedResult.referral && (
                <div className="text-xs text-emerald-900 font-mono">
                  Referral Ticket Dispatched: <strong>{completedResult.referral.referralCode}</strong> (Urgency: {completedResult.referral.urgency.toUpperCase()})
                </div>
              )}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => navigate(`/referrals`)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg cursor-pointer border-none"
                >
                  View on Referral Board
                </button>
                <button
                  onClick={() => navigate(`/patient/${currentPatient._id}`)}
                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 font-bold text-xs rounded-lg cursor-pointer"
                >
                  View Timeline Record
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
