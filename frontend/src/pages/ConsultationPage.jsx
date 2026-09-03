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

  const currentPatient = patients?.find((p) => p._id === selectedPatientId) || activePatient || patients?.[0];


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
        {/* Left Column: Video Feed (5 cols) */}
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

              {/* End Call */}
              <button
                className="px-3.5 py-1.5 rounded-xl font-bold font-mono text-xs flex items-center gap-2 cursor-pointer border-none transition-all shadow-xs bg-rose-600 hover:bg-rose-500 text-white"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Call</span>
              </button>
            </div>
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
