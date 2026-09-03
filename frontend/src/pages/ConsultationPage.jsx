import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { api } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useWebRTC } from "../hooks/useWebRTC.js";
import { searchDrugs } from "../hooks/useDrugSearch.js";
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
  Languages,
  PauseCircle,
  PlayCircle,
  ScrollText,
  Sparkles,
  Radio,
  Copy,
  Check,
  Pill,
  Search,
  ExternalLink,
  Users,
} from "lucide-react";

// ─── Live Transcription Panel Component ────────────────────────────
function LiveTranscriptionPanel({
  transcriptId,
  setTranscriptId,
  entries,
  setEntries,
  isRecording,
  setIsRecording,
  patientId,
  callMode,
  user,
}) {
  const [interimText, setInterimText] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState("doctor");
  const [language, setLanguage] = useState("en-IN");
  const [isPaused, setIsPaused] = useState(false);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, interimText]);

  // Initialize Web Speech API
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          const newEntry = {
            speaker: currentSpeaker,
            speakerName:
              currentSpeaker === "doctor"
                ? user?.name || "Doctor"
                : currentSpeaker === "asha"
                  ? "ASHA Worker"
                  : "Patient",
            text: text.trim(),
            confidence: Math.round(confidence * 100) / 100,
            timestamp: new Date().toISOString(),
          };

          setEntries((prev) => [...prev, newEntry]);
          setInterimText("");

          // Send to backend
          if (transcriptId) {
            api
              .post(`/transcripts/${transcriptId}/append`, {
                speaker: currentSpeaker,
                speakerName: newEntry.speakerName,
                text: text.trim(),
                confidence: newEntry.confidence,
              })
              .catch((err) =>
                console.error("Failed to save transcript entry:", err)
              );
          }
        } else {
          interim += text;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone permissions.");
      }
    };

    recognition.onend = () => {
      // Auto-restart if still recording and not paused
      if (isRecording && !isPaused && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // already started
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, currentSpeaker, transcriptId, user, isRecording, isPaused]);

  // Start Transcription Session
  const handleStartTranscription = async () => {
    if (!patientId) {
      alert("Please select a patient first.");
      return;
    }

    try {
      const res = await api.post("/transcripts/start", {
        patientId,
        callMode,
        language,
      });

      setTranscriptId(res.data.data._id);
      setEntries([]);
      setIsRecording(true);
      startSpeechRecognition();
    } catch (err) {
      console.error("Failed to start transcript:", err);
      alert("Failed to start transcription session.");
    }
  };

  // Stop/Pause
  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      startSpeechRecognition();
    } else {
      setIsPaused(true);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const handleStopTranscription = () => {
    setIsRecording(false);
    setIsPaused(false);
    setInterimText("");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Restart recognition when speaker or language changes mid-recording
  useEffect(() => {
    if (isRecording && !isPaused && recognitionRef.current) {
      recognitionRef.current.stop();
      setTimeout(() => startSpeechRecognition(), 200);
    }
  }, [currentSpeaker, language]);

  const speakerColors = {
    doctor: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-800", dot: "bg-teal-500" },
    patient: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", dot: "bg-amber-500" },
    asha: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-800", dot: "bg-violet-500" },
    system: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-500", dot: "bg-slate-400" },
  };

  return (
    <div className="bg-white rounded-3xl border border-[#D3D4C0] shadow-xs overflow-hidden">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-[#1f2229] to-[#2d3140] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center">
            <ScrollText className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-serif">
              Live Call Transcription
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              {isRecording
                ? isPaused
                  ? "⏸ PAUSED"
                  : "● LIVE — AI-Powered Speech-to-Text"
                : "Ready to start"}
            </p>
          </div>
        </div>

        {isRecording && (
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${isPaused ? "bg-amber-400" : "bg-red-500 animate-pulse"
                }`}
            />
            <span className="text-[10px] font-mono text-slate-400">
              {isPaused ? "PAUSED" : "REC"}
            </span>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="border-b border-[#D3D4C0] px-4 py-3 flex flex-wrap items-center gap-2">
        {/* Speaker Toggle */}
        <div className="flex bg-[#FAF7F2] rounded-xl p-0.5 text-[10px] font-mono border border-[#D3D4C0]">
          {["doctor", "patient", "asha"].map((s) => (
            <button
              key={s}
              onClick={() => setCurrentSpeaker(s)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer border-none font-bold transition-all ${currentSpeaker === s
                  ? "bg-[#1f2229] text-white shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              {s === "doctor" ? "🩺 Doctor" : s === "patient" ? "🧑 Patient" : "👩‍⚕️ ASHA"}
            </button>
          ))}
        </div>

        {/* Language Select */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Languages className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isRecording}
            className="text-[10px] font-mono px-2 py-1.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-lg text-slate-700"
          >
            <option value="en-IN">English (IN)</option>
            <option value="hi-IN">Hindi</option>
            <option value="ta-IN">Tamil</option>
            <option value="te-IN">Telugu</option>
            <option value="bn-IN">Bengali</option>
            <option value="mr-IN">Marathi</option>
            <option value="gu-IN">Gujarati</option>
            <option value="kn-IN">Kannada</option>
            <option value="ml-IN">Malayalam</option>
            <option value="or-IN">Odia</option>
            <option value="pa-IN">Punjabi</option>
          </select>
        </div>
      </div>

      {/* Transcript Entries */}
      <div
        ref={scrollRef}
        className="px-4 py-3 max-h-[320px] min-h-[160px] overflow-y-auto flex flex-col gap-2"
        style={{ scrollBehavior: "smooth" }}
      >
        {entries.length === 0 && !interimText && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Radio className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-xs text-slate-400 font-mono">
              {isRecording
                ? "Listening... Speak into the microphone."
                : "Start transcription to capture the consultation dialogue."}
            </p>
          </div>
        )}

        {entries.map((entry, idx) => {
          const colors = speakerColors[entry.speaker] || speakerColors.system;
          return (
            <div
              key={idx}
              className={`${colors.bg} ${colors.border} border rounded-2xl px-3.5 py-2.5 animate-fadeIn`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                <span
                  className={`text-[10px] font-mono font-bold uppercase ${colors.text}`}
                >
                  {entry.speakerName}
                </span>
                <span className="text-[9px] text-slate-400 font-mono ml-auto">
                  {new Date(entry.timestamp).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                {entry.confidence < 0.7 && (
                  <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-mono">
                    LOW CONF
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-800 leading-relaxed">
                {entry.text}
              </p>
            </div>
          );
        })}

        {/* Interim (live/in-progress) text */}
        {interimText && (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl px-3.5 py-2.5 animate-pulse">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                listening...
              </span>
            </div>
            <p className="text-xs text-slate-500 italic">{interimText}</p>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="border-t border-[#D3D4C0] px-4 py-3 flex items-center gap-2">
        {!isRecording ? (
          <button
            onClick={handleStartTranscription}
            className="flex-1 py-2.5 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            <Mic className="w-4 h-4" />
            <span>Start Live Transcription</span>
            <Sparkles className="w-3 h-3 text-teal-300" />
          </button>
        ) : (
          <>
            <button
              onClick={handlePauseResume}
              className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${isPaused
                  ? "bg-teal-700 hover:bg-teal-800 text-white"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300"
                }`}
            >
              {isPaused ? (
                <>
                  <PlayCircle className="w-4 h-4" /> Resume
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4" /> Pause
                </>
              )}
            </button>
            <button
              onClick={handleStopTranscription}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <MicOff className="w-4 h-4" />
              <span>Stop Recording</span>
            </button>
          </>
        )}
      </div>

      {/* Stats Footer */}
      {entries.length > 0 && (
        <div className="bg-[#FAF7F2] border-t border-[#D3D4C0] px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>
            {entries.length} entries · {entries.filter((e) => e.speaker === "doctor").length} doctor · {entries.filter((e) => e.speaker === "patient").length} patient
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-500" />
            AI summary generated on finalize
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Fuzzy Search Medicine Autocomplete Input ─────────────────────
function MedicineAutocompleteInput({ value, onChange, onSelectDrug }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const suggestions = React.useMemo(() => {
    return searchDrugs(value, 6);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (drug) => {
    onChange(drug.name);
    if (onSelectDrug) {
      onSelectDrug(drug);
    }
    setIsOpen(false);
  };

  const categoryColors = {
    "Antibiotics": "bg-blue-50 text-blue-700 border-blue-200",
    "Antihypertensives": "bg-purple-50 text-purple-700 border-purple-200",
    "Antidiabetic": "bg-amber-50 text-amber-700 border-amber-200",
    "Analgesics / Antipyretics": "bg-rose-50 text-rose-700 border-rose-200",
    "Maternal / Iron-Folic": "bg-pink-50 text-pink-700 border-pink-200",
    "Pediatric / ORS": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Emergency / Life-Saving": "bg-red-100 text-red-800 border-red-300 font-bold",
    "GI / Antacids": "bg-teal-50 text-teal-700 border-teal-200",
    "Respiratory": "bg-cyan-50 text-cyan-700 border-cyan-200",
    "Antiallergic": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Vitamins / Supplements": "bg-lime-50 text-lime-800 border-lime-200",
    "Dermatological": "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Search drug name (e.g. Amox, Paracetamol, Iron, Telmi)..."
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-8 pr-3 py-2 bg-white border border-[#D3D4C0] rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-700 shadow-2xs text-slate-800"
        />
        <Pill className="w-3.5 h-3.5 text-teal-700 absolute left-2.5 pointer-events-none" />
      </div>

      {/* Fuzzy Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#D3D4C0] rounded-2xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto animate-fadeIn">
          <div className="bg-[#FAF7F2] px-3 py-1.5 border-b border-[#D3D4C0] flex items-center justify-between text-[10px] font-mono text-slate-500 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-700" />
              NLEM Essential Medicines Autocomplete
            </span>
            <span>{suggestions.length} matches</span>
          </div>

          <div className="divide-y divide-slate-100">
            {suggestions.map((drug, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelect(drug)}
                className="w-full px-3.5 py-2.5 text-left hover:bg-teal-50/70 transition-colors flex flex-col gap-1 cursor-pointer border-none bg-transparent"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#1f2229] font-sans">
                    {drug.name}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                      categoryColors[drug.category] || "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {drug.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Generic: <strong className="text-slate-700">{drug.genericName}</strong></span>
                  <span className="text-teal-800 font-semibold">{drug.frequency} · {drug.duration}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Consultation Page ────────────────────────────────────────
export function ConsultationPage() {
  const { patientId } = useParams();
  const { patients, activePatient, setActivePatient, refreshPatients } = useOutletContext();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [selectedPatientId, setSelectedPatientId] = useState(patientId || activePatient?._id || "");
  const [facilities, setFacilities] = useState([]);
  const [mode, setMode] = useState("video");
  const [linkCopied, setLinkCopied] = useState(false);

  // Active patient reference
  const currentPatient = patients?.find((p) => p._id === selectedPatientId) || activePatient || patients?.[0];
  const callRoomId = selectedPatientId || currentPatient?._id || "teleconsult-101";

  // WebRTC Video/Voice Calling Hook
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
    localStream,
    remoteStream,
    isConnected: isCallConnected,
    isCallActive,
    isAudioMuted,
    isVideoMuted,
    remoteUser,
    callStatus,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useWebRTC({
    roomId: callRoomId,
    userName: user?.name || "Dr. Prakash Sharma",
    userRole: "doctor",
    autoStart: true,
  });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Transcript state
  const [transcriptId, setTranscriptId] = useState(null);
  const [transcriptEntries, setTranscriptEntries] = useState([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptSummary, setTranscriptSummary] = useState("");
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(true);

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

    return () => {};
  }, []);


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
      const consultationData = res.data.data;
      setCompletedResult(consultationData);

      // Finalize transcript with consultation link
      if (transcriptId) {
        try {
          const finRes = await api.patch(`/transcripts/${transcriptId}/finalize`, {
            consultationId: consultationData.consultation._id,
            durationSeconds: consultationData.consultation.durationMinutes * 60,
          });
          setTranscriptSummary(finRes.data.data.summary || "");
        } catch (err) {
          console.error("Failed to finalize transcript:", err);
        }
      }

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
            Medical Officer teleconsultation with ASHA-assisted rural patient video & voice connectivity.
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



      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Video Feed + Transcription (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Video Panel */}
          <div className="bg-[#1f2229] border border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[420px] text-white relative overflow-hidden">
            {/* Video Header Bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 bg-teal-950 border border-teal-700 text-teal-300 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isCallConnected ? "bg-teal-400 animate-pulse" : "bg-amber-400"}`} />
                  <span>{isCallConnected ? "Live Peer Connected" : "Room Ready"}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Copy Patient/ASHA Invite Link */}
                <button
                  type="button"
                  onClick={() => {
                    const joinUrl = `${window.location.origin}/call/${callRoomId}`;
                    navigator.clipboard.writeText(joinUrl);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2500);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-teal-900 border border-slate-700 text-teal-300 hover:text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Copy shareable link for ASHA worker or patient on 2nd device"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-3 h-3 text-teal-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3 text-teal-400" />
                      <span>ASHA Link</span>
                    </>
                  )}
                </button>

                {/* Video / Voice Toggle */}
                <div className="flex bg-slate-800 rounded-xl p-0.5 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setMode("video")}
                    className={`px-2 py-1 rounded-lg cursor-pointer border-none transition-all ${
                      mode === "video" ? "bg-teal-700 text-white font-bold" : "bg-transparent text-slate-400"
                    }`}
                  >
                    Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("voice")}
                    className={`px-2 py-1 rounded-lg cursor-pointer border-none transition-all ${
                      mode === "voice" ? "bg-teal-700 text-white font-bold" : "bg-transparent text-slate-400"
                    }`}
                  >
                    Voice
                  </button>
                </div>
              </div>
            </div>

            {/* Video Canvas Area */}
            <div className="my-auto relative w-full aspect-video min-h-[220px] bg-black/40 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center my-3">
              {/* Remote Video Stream (Patient/ASHA) */}
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2.5 py-4 text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-teal-500/40 flex items-center justify-center">
                    <Stethoscope className="w-7 h-7 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-white">{currentPatient?.name || "Patient Feed"}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {isCallConnected
                        ? "Audio stream receiving..."
                        : "Waiting for ASHA / Patient on 2nd device"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const joinUrl = `${window.location.origin}/call/${callRoomId}`;
                      navigator.clipboard.writeText(joinUrl);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2500);
                    }}
                    className="mt-1 px-3 py-1.5 bg-teal-900/60 hover:bg-teal-800 border border-teal-600/50 rounded-xl text-[10px] font-mono text-teal-200 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{linkCopied ? "Link Copied to Clipboard!" : "Copy /call Link for 2nd Device"}</span>
                  </button>
                </div>
              )}

              {/* Local Doctor Video PIP Overlay */}
              <div className="absolute bottom-2.5 right-2.5 w-24 sm:w-32 aspect-video bg-slate-900 border border-teal-500/50 rounded-xl overflow-hidden shadow-lg z-20">
                {localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[9px] text-slate-400 font-mono">
                    <span>Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-0.5 left-0.5 px-1 py-0.2 bg-black/70 rounded text-[8px] font-mono text-white">
                  You (Dr)
                </div>
              </div>
            </div>

            {/* Vitals Strip */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-2.5 flex items-center justify-between text-[11px] font-mono text-slate-300 mb-3">
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
                  type="button"
                  onClick={toggleAudio}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all ${
                    isAudioMuted ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  title={isAudioMuted ? "Unmute Doctor Mic" : "Mute Doctor Mic"}
                >
                  {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all ${
                    isVideoMuted ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  title={isVideoMuted ? "Start Camera" : "Stop Camera"}
                >
                  {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>

              {/* End Call / Rejoin */}
              {isCallActive ? (
                <button
                  type="button"
                  onClick={endCall}
                  className="px-3.5 py-1.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer border-none transition-all shadow-xs bg-rose-600 hover:bg-rose-500 text-white"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>End Call</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCall}
                  className="px-3.5 py-1.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer border-none transition-all shadow-xs bg-teal-700 hover:bg-teal-600 text-white"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start Call</span>
                </button>
              )}

              {/* Toggle Transcript Panel */}
              <button
                type="button"
                onClick={() => setShowTranscriptPanel(!showTranscriptPanel)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all ${
                  showTranscriptPanel ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
                title="Toggle Transcription Panel"
              >
                <ScrollText className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Transcription Panel */}
          {showTranscriptPanel && (
            <LiveTranscriptionPanel
              transcriptId={transcriptId}
              setTranscriptId={setTranscriptId}
              entries={transcriptEntries}
              setEntries={setTranscriptEntries}
              isRecording={isTranscribing}
              setIsRecording={setIsTranscribing}
              patientId={selectedPatientId || currentPatient?._id}
              callMode={mode}
              user={user}
            />
          )}
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
                      <MedicineAutocompleteInput
                        value={med.medicine}
                        onChange={(val) => handleUpdateMedicine(idx, "medicine", val)}
                        onSelectDrug={(drug) => {
                          handleUpdateMedicine(idx, "medicine", drug.name);
                          if (drug.dosage) handleUpdateMedicine(idx, "dosage", drug.dosage);
                          if (drug.frequency) handleUpdateMedicine(idx, "frequency", drug.frequency);
                          if (drug.duration) handleUpdateMedicine(idx, "duration", drug.duration);
                          if (drug.instructions) handleUpdateMedicine(idx, "instructions", drug.instructions);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer bg-transparent border-none transition-colors"
                        title="Remove medicine"
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

          {/* Completion Result */}
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

              {/* Transcript Summary */}
              {transcriptSummary && (
                <div className="mt-2 p-3 bg-teal-50 border border-teal-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-[10px] font-mono font-bold text-teal-800 uppercase">
                      AI Transcript Summary
                    </span>
                  </div>
                  <p className="text-xs text-teal-900 leading-relaxed">
                    {transcriptSummary}
                  </p>
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
