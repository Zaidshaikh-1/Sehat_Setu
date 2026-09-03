import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { api } from "../utils/api.js";
import {
  Users,
  Activity,
  Stethoscope,
  Share2,
  Calendar,
  FlaskConical,
  Pill,
  HeartPulse,
  ShieldCheck,
  ChevronRight,
  FileText,
  Clock,
  MapPin,
  Phone,
  ScrollText,
  Sparkles,
  ChevronDown,
  Mic,
} from "lucide-react";

export function PatientRecordPage() {
  const { patientId } = useParams();
  const { patients, activePatient, setActivePatient } = useOutletContext();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [expandedTranscriptId, setExpandedTranscriptId] = useState(null);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);

  const currentId = patientId || activePatient?._id || patients?.[0]?._id;

  useEffect(() => {
    async function loadTimeline() {
      if (!currentId) return;
      setLoading(true);
      try {
        const res = await api.get(`/patients/${currentId}/timeline`);
        if (res.data?.data) {
          setPatient(res.data.data.patient);
          setTimeline(res.data.data.timeline || []);
          setActivePatient(res.data.data.patient);
        }
      } catch (err) {
        console.error("Failed to load patient timeline", err);
      } finally {
        setLoading(false);
      }
    }

    async function loadTranscripts() {
      if (!currentId) return;
      setLoadingTranscripts(true);
      try {
        const res = await api.get(`/transcripts/patient/${currentId}`);
        if (res.data?.data) {
          setTranscripts(res.data.data);
        }
      } catch (err) {
        // Transcripts may not exist yet — graceful fallback
        console.log("No transcripts available for patient");
      } finally {
        setLoadingTranscripts(false);
      }
    }

    loadTimeline();
    loadTranscripts();
  }, [currentId]);

  const filteredTimeline = timeline.filter((entry) => {
    if (activeFilter === "all") return true;
    return entry.type === activeFilter;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="w-3.5 h-3.5 text-teal-700" />;
      case "triage":
        return <Activity className="w-3.5 h-3.5 text-amber-700" />;
      case "referral":
        return <Share2 className="w-3.5 h-3.5 text-blue-700" />;
      case "prescription":
        return <Pill className="w-3.5 h-3.5 text-purple-700" />;
      case "lab":
        return <FlaskConical className="w-3.5 h-3.5 text-pink-700" />;
      case "immunization":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />;
      case "vitals":
        return <HeartPulse className="w-3.5 h-3.5 text-rose-700" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getInitials = (name) => {
    if (!name) return "PT";
    const parts = name.split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 font-sans">
        <div className="w-7 h-7 rounded-full border-2 border-teal-700 border-t-transparent animate-spin" />
        <span className="text-xs font-mono font-bold uppercase">Loading ABHA Health Record...</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs font-sans">
        No patient record selected.
      </div>
    );
  }

  const isHighRisk = patient.isHighRiskMaternal || patient.riskTier === "high" || patient.riskTier === "critical";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left font-sans text-slate-800">
      {/* Patient Demographic Banner */}
      <div className="bg-white border border-[#D3D4C0] rounded-3xl p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl border-2 border-dashed flex items-center justify-center text-base font-bold shrink-0 ${isHighRisk
                ? "border-rose-400 bg-rose-50 text-rose-800"
                : "border-[#D3D4C0] bg-[#FAF7F2] text-slate-800"
              }`}
          >
            {getInitials(patient.name)}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h2 className="text-3xl font-serif font-bold text-[#1f2229] tracking-tight">{patient.name}</h2>
              {isHighRisk && (
                <span className="px-2.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-md text-[10px] font-bold uppercase">
                  High-Risk Case
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1 font-medium font-sans">
              <span className="font-mono text-teal-800 font-bold">ABHA: {patient.abhaId}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {patient.village}, {patient.district}</span>
              <span>·</span>
              <span>{patient.age} yrs ({patient.gender})</span>
              <span>·</span>
              <span className="font-mono">{patient.bloodGroup}</span>
            </div>

            {/* Conditions Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {patient.conditions?.map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 bg-[#FAF7F2] text-slate-700 rounded-md text-[10.5px] font-medium border border-[#D3D4C0]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => navigate(`/triage/${patient._id}`)}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-[#FAF7F2] hover:bg-white text-slate-700 border border-[#D3D4C0] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-teal-700" />
            <span>New Triage</span>
          </button>

          <button
            onClick={() => navigate(`/consultation/${patient._id}`)}
            className="flex-1 md:flex-initial px-5 py-2.5 bg-[#1f2229] hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Start Consult</span>
          </button>
        </div>
      </div>

      {/* Main Content: Timeline (8 cols) + Right Insights (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Longitudinal Timeline (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-[#D3D4C0]">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full no-scrollbar text-xs font-semibold">
              {[
                { id: "all", label: `All Events (${timeline.length})` },
                { id: "consultation", label: "Consults" },
                { id: "triage", label: "Triage" },
                { id: "referral", label: "Referrals" },
                { id: "prescription", label: "Prescriptions" },
                { id: "lab", label: "Labs" },
                { id: "immunization", label: "Vaccines" },
                { id: "transcripts", label: `Transcripts (${transcripts.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer border ${activeFilter === tab.id
                      ? "bg-[#1f2229] text-white border-[#1f2229] shadow-xs font-bold"
                      : "bg-transparent text-slate-600 border-transparent hover:bg-[#FAF7F2]"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Stream */}
          <div className="flex flex-col gap-3">
            {filteredTimeline.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-[#D3D4C0] text-slate-400 text-xs text-center">
                No clinical events found for this filter.
              </div>
            ) : (
              filteredTimeline.map((entry, idx) => {
                const isExpanded = expandedEntryId === entry.id;
                const dateObj = new Date(entry.date);
                const formattedDate = dateObj.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div key={entry.id || idx} className="bg-white border border-[#D3D4C0] rounded-2xl p-6 shadow-xs text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-[#D3D4C0]/50">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#D3D4C0] flex items-center justify-center">
                          {getEventIcon(entry.type)}
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-[#FAF7F2] text-slate-700 rounded border border-[#D3D4C0]">
                          {entry.type}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {entry.facility}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{formattedDate} at {formattedTime}</span>
                      </div>
                    </div>

                    <h4 className="text-base font-serif font-bold text-[#1f2229] mt-3">{entry.title}</h4>
                    {entry.subtitle && (
                      <div className="text-xs text-teal-800 font-medium mt-0.5">{entry.subtitle}</div>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#D3D4C0]">
                      {entry.summary}
                    </p>

                    {/* Prescriptions List if any */}
                    {entry.prescription?.length > 0 && (
                      <div className="mt-3 flex flex-col gap-1.5 pt-2 border-t border-[#D3D4C0]/60">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Prescription Regimen</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {entry.prescription.map((med, i) => (
                            <div key={i} className="p-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl text-xs">
                              <strong className="text-slate-900 block">{med.medicine}</strong>
                              <span className="text-[10.5px] text-slate-600">{med.frequency} · {med.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FHIR Resource JSON Accordion */}
                    {entry.fhirResource && (
                      <div className="mt-3 pt-2 border-t border-[#D3D4C0]/60">
                        <button
                          onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                          className="text-[10px] font-mono font-bold text-teal-800 hover:text-teal-950 cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
                        >
                          <span>{isExpanded ? "Hide FHIR R4 Resource JSON" : "Inspect FHIR R4 Standard Payload"}</span>
                          <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        </button>
                        {isExpanded && (
                          <pre className="mt-2 p-3.5 bg-slate-900 text-teal-300 rounded-xl text-[10px] font-mono overflow-x-auto">
                            {JSON.stringify(entry.fhirResource, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar: Vitals, Contacts & Transcripts (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col gap-3">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Latest Vitals Reading</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D3D4C0] flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono">Blood Pressure</span>
                <span className="text-base font-bold text-slate-900 mt-0.5">
                  {patient.vitalsLatest?.systolicBP ? `${patient.vitalsLatest.systolicBP}/${patient.vitalsLatest.diastolicBP}` : "120/80"} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                </span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D3D4C0] flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono">SpO2 Oxygen</span>
                <span className="text-base font-bold text-slate-900 mt-0.5">
                  {patient.vitalsLatest?.spO2 || 98} <span className="text-[10px] font-normal text-slate-500">%</span>
                </span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D3D4C0] flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono">Hemoglobin (Hb)</span>
                <span className="text-base font-bold text-slate-900 mt-0.5">
                  {patient.vitalsLatest?.hemoglobin || 10.4} <span className="text-[10px] font-normal text-slate-500">g/dL</span>
                </span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D3D4C0] flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono">Blood Sugar</span>
                <span className="text-base font-bold text-slate-900 mt-0.5">
                  {patient.vitalsLatest?.bloodSugar || 110} <span className="text-[10px] font-normal text-slate-500">mg/dL</span>
                </span>
              </div>
            </div>
          </div>

          {/* Call Transcripts Panel */}
          <div className="bg-white rounded-3xl border border-[#D3D4C0] shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1f2229] to-[#2d3140] px-5 py-3.5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <ScrollText className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Call Transcripts</h4>
                <p className="text-[9px] text-slate-400 font-mono">
                  {transcripts.length} recorded session{transcripts.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {loadingTranscripts ? (
                <div className="p-6 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-teal-700 border-t-transparent animate-spin" />
                </div>
              ) : transcripts.length === 0 ? (
                <div className="p-6 text-center">
                  <Mic className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-[11px] text-slate-400 font-mono">No call transcripts recorded yet.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {transcripts.map((t) => {
                    const isExpanded = expandedTranscriptId === t._id;
                    const dateObj = new Date(t.createdAt);
                    const dialogueEntries = t.entries?.filter((e) => e.speaker !== "system") || [];

                    return (
                      <div key={t._id} className="border-b border-[#D3D4C0]/60 last:border-b-0">
                        <button
                          onClick={() => setExpandedTranscriptId(isExpanded ? null : t._id)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#FAF7F2] transition-colors cursor-pointer bg-transparent border-none text-left"
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === "active" ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                            }`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-800 truncate">
                              {t.callMode?.toUpperCase()} Call · {dialogueEntries.length} exchanges
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}{" "}
                              at {dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              {t.doctor?.name && ` · Dr. ${t.doctor.name}`}
                            </div>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""
                            }`} />
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 flex flex-col gap-2 animate-fadeIn">
                            {/* AI Summary */}
                            {t.summary && (
                              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <Sparkles className="w-3 h-3 text-teal-600" />
                                  <span className="text-[9px] font-mono font-bold text-teal-800 uppercase">AI Clinical Summary</span>
                                </div>
                                <p className="text-[11px] text-teal-900 leading-relaxed">{t.summary}</p>
                              </div>
                            )}

                            {/* Dialogue Entries */}
                            <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto">
                              {dialogueEntries.map((entry, idx) => {
                                const colors = {
                                  doctor: { bg: "bg-teal-50", text: "text-teal-800", dot: "bg-teal-500" },
                                  patient: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" },
                                  asha: { bg: "bg-violet-50", text: "text-violet-800", dot: "bg-violet-500" },
                                };
                                const c = colors[entry.speaker] || colors.patient;
                                return (
                                  <div key={idx} className={`${c.bg} rounded-xl px-3 py-2`}>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                                      <span className={`text-[9px] font-mono font-bold uppercase ${c.text}`}>
                                        {entry.speakerName}
                                      </span>
                                      <span className="text-[8px] text-slate-400 font-mono ml-auto">
                                        {new Date(entry.timestamp).toLocaleTimeString("en-IN", {
                                          hour: "2-digit", minute: "2-digit", second: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-700 leading-relaxed">{entry.text}</p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1.5 border-t border-[#D3D4C0]/40">
                              <span>Language: {t.language || "en-IN"}</span>
                              <span>
                                {t.status === "completed" ? "✓ Finalized" : "● Active"}
                                {t.durationSeconds > 0 && ` · ${Math.round(t.durationSeconds / 60)}m`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col gap-2 text-left">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Assigned Frontline Worker</span>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D3D4C0] text-slate-900 flex items-center justify-center text-xs font-bold">
                MJ
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">{patient.assignedAsha?.name || "Meera Jadhav (ASHA Lead)"}</span>
                <span className="text-[10.5px] text-slate-500">{patient.assignedAsha?.phone || "+91 98220 14829"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col gap-2 text-left">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Emergency Kin Contact</span>
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-bold text-slate-900">{patient.emergencyContact?.name || "Family Guardian"}</span>
              <span className="text-slate-500 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3" /> {patient.emergencyContact?.phone || "+91 98214 77202"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
