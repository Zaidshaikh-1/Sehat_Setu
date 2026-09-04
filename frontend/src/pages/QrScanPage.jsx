import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../utils/api.js";
import {
  QrCode,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Building2,
  User,
  Truck,
  HeartPulse,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Loader2,
  Sparkles,
  Phone,
  Home
} from "lucide-react";

const STAGES = [
  { id: "issued", label: "Issued", description: "Referral Created", icon: Clock },
  { id: "traveling", label: "Travelling", description: "En-Route to Facility", icon: Truck },
  { id: "arrived", label: "Admitted", description: "Arrived at Hospital", icon: Building2 },
  { id: "seen", label: "Discharged", description: "Care Completed", icon: CheckCircle2 },
];

export function QrScanPage() {
  const { referralId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [scannedRole, setScannedRole] = useState("Hospital Staff / Transport");
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/qr/scan-status/${referralId}`);
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Scan lookup failed", err);
      setError(err.response?.data?.message || "Could not retrieve referral details. Please check the QR code or link.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (referralId) {
      fetchStatus();
    }
  }, [referralId]);

  const handleScanAction = async () => {
    if (!data?.nextStatus || updating) return;

    setUpdating(true);
    setSuccessMessage(null);
    try {
      const res = await api.post(`/qr/scan/${referralId}`, {
        scannedBy: scannedRole,
        scannerRole: scannedRole,
      });

      if (res.data?.data) {
        const action = res.data.data.actionName || data.actionName;
        setSuccessMessage(`Patient successfully marked as ${action}!`);
        // Refresh updated data
        await fetchStatus();
      }
    } catch (err) {
      console.error("Scan action failed", err);
      alert(err.response?.data?.message || "Failed to advance referral status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const getStageIndex = (status) => {
    if (status === "closed") return 3;
    const idx = STAGES.findIndex((s) => s.id === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStageIndex = data?.referral ? getStageIndex(data.referral.status) : 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 font-sans flex flex-col items-center justify-start p-4 sm:p-6">
      {/* Top Navbar */}
      <header className="w-full max-w-xl flex items-center justify-between py-3 mb-4 border-b border-[#D3D4C0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
            S
          </div>
          <div>
            <h1 className="font-serif font-bold text-slate-900 text-lg leading-tight">
              Sehat Setu
            </h1>
            <p className="text-[10px] text-teal-800 font-mono uppercase tracking-wider font-semibold">
              Transit Checkpoint Scanner
            </p>
          </div>
        </div>

        <Link
          to="/referrals"
          className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#D3D4C0] shadow-2xs"
        >
          <Home className="w-3.5 h-3.5" />
          Dashboard
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-xl flex flex-col gap-4">
        {loading ? (
          <div className="bg-white rounded-3xl border border-[#D3D4C0] p-10 flex flex-col items-center justify-center gap-3 shadow-xs">
            <Loader2 className="w-8 h-8 text-teal-800 animate-spin" />
            <span className="text-xs font-mono text-slate-600">Verifying referral token...</span>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-rose-200 p-6 flex flex-col items-center text-center gap-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-serif font-bold text-slate-900">QR Checkpoint Not Found</h2>
            <p className="text-xs text-slate-600">{error}</p>
            <button
              onClick={fetchStatus}
              className="mt-2 px-4 py-2 bg-teal-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Success Banner if just scanned */}
            {successMessage && (
              <div className="bg-emerald-100/90 border border-emerald-300 text-emerald-950 p-4 rounded-2xl flex items-center gap-3 shadow-xs animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="text-xs font-medium">
                  <strong>Checkpoint Verified!</strong> {successMessage}
                </div>
              </div>
            )}

            {/* Patient & Ticket Card */}
            <div className="bg-white rounded-3xl border border-[#D3D4C0] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2 border-b border-[#D3D4C0]/60 pb-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-teal-800 font-bold uppercase tracking-wider">
                    Referral Ticket
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
                    {data.referral.referralCode}
                  </h2>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase font-mono ${
                    data.referral.urgency === "emergency"
                      ? "bg-rose-700 text-white"
                      : data.referral.urgency === "urgent"
                      ? "bg-amber-700 text-white"
                      : "bg-[#FAF7F2] border border-[#D3D4C0] text-slate-700"
                  }`}
                >
                  {data.referral.urgency}
                </span>
              </div>

              {/* Patient Info */}
              <div className="flex items-center gap-3 p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D3D4C0]">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold font-mono">
                  {data.referral.patient?.name?.charAt(0) || "P"}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-bold text-slate-900">
                    {data.referral.patient?.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>{data.referral.patient?.gender?.toUpperCase()}, {data.referral.patient?.age}y</span>
                    <span>•</span>
                    <span>ABHA: {data.referral.patient?.abhaId}</span>
                  </div>
                </div>
              </div>

              {/* Transit Facility Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#D3D4C0] flex flex-col">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">From (Origin)</span>
                  <span className="font-bold text-slate-900 mt-0.5 truncate">
                    {data.referral.fromFacility?.name || "Sub-Centre / PHC"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {data.referral.fromFacility?.location?.village || "Origin Facility"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200/80 flex flex-col">
                  <span className="text-[10px] font-mono text-teal-800 uppercase font-bold">To (Destination)</span>
                  <span className="font-bold text-teal-950 mt-0.5 truncate">
                    {data.referral.toFacility?.name || "Hospital"}
                  </span>
                  <span className="text-[11px] text-teal-700">
                    {data.referral.toFacility?.location?.district || "Receiving Facility"}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong className="text-slate-900">Clinical Reason:</strong> {data.referral.reason}
              </div>
            </div>

            {/* Stepper Progress Card */}
            <div className="bg-white rounded-3xl border border-[#D3D4C0] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                Transit Pipeline Progress
              </h3>

              <div className="grid grid-cols-4 gap-2 relative">
                {STAGES.map((stage, idx) => {
                  const isDone = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.id} className="flex flex-col items-center text-center gap-1.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                          isCurrent
                            ? "bg-teal-800 text-white ring-4 ring-teal-100 shadow-sm"
                            : isDone
                            ? "bg-teal-100 text-teal-800 border border-teal-300"
                            : "bg-[#FAF7F2] text-slate-400 border border-[#D3D4C0]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[11px] font-bold ${isDone ? "text-slate-900" : "text-slate-400"}`}>
                        {stage.label}
                      </span>
                      <span className="text-[9px] text-slate-500 hidden sm:block">
                        {stage.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QR Action Section */}
            <div className="bg-white rounded-3xl border border-[#D3D4C0] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              {data.isCompleted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center gap-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-700" />
                  <h4 className="text-lg font-serif font-bold text-emerald-950">
                    Referral Completed & Discharged
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-sm">
                    All milestones for this referral ticket have been completed. The patient has been seen and discharged with the feedback loop closed.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-teal-800 font-bold uppercase tracking-wider">
                      Next Transit Action
                    </span>
                    <h4 className="text-lg font-serif font-bold text-slate-900 mt-0.5">
                      Confirm Checkpoint Scan
                    </h4>
                    <p className="text-xs text-slate-600">
                      Scanning this QR code advances the patient to the next milestone:
                    </p>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Next Status:</span>
                    <span className="px-2.5 py-1 bg-teal-800 text-white rounded-lg font-bold font-mono text-xs uppercase">
                      {data.actionName || data.nextStatus}
                    </span>
                  </div>

                  {/* Scanner Role selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-slate-500 font-semibold">
                      Checkpoint Operator / Role:
                    </label>
                    <select
                      value={scannedRole}
                      onChange={(e) => setScannedRole(e.target.value)}
                      className="p-2.5 rounded-xl border border-[#D3D4C0] bg-white text-xs font-semibold text-slate-800 focus:outline-teal-700"
                    >
                      <option value="Ambulance / Transport Driver">Ambulance / Transport Driver</option>
                      <option value="Receiving Hospital Triage Desk">Receiving Hospital Triage Desk</option>
                      <option value="Admitting Medical Officer">Admitting Medical Officer</option>
                      <option value="Discharge Coordinator">Discharge Coordinator</option>
                      <option value="ASHA Worker / Companion">ASHA Worker / Companion</option>
                    </select>
                  </div>

                  {/* Big Confirmation Button */}
                  <button
                    onClick={handleScanAction}
                    disabled={updating}
                    className="w-full py-4 px-6 bg-teal-800 hover:bg-teal-900 active:scale-[0.99] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating Transit Record...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5" />
                        Confirm Scan: Mark as {data.actionName || data.nextLabel}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Checkpoint Audit Trail */}
            {data.referral.statusHistory?.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#D3D4C0] p-5 sm:p-6 shadow-xs flex flex-col gap-3">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                  Verified Checkpoint Timestamps
                </h3>
                <div className="flex flex-col gap-2">
                  {data.referral.statusHistory.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl flex flex-col text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 uppercase font-mono text-[11px]">
                          {entry.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(entry.timestamp).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 mt-0.5">
                        {entry.note || `Status milestone updated by ${entry.updatedByName || "Staff"}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl text-center py-6 text-slate-400 text-[11px] font-mono">
        Sehat Setu • Closed-Loop Rural Health Referral Network
      </footer>
    </div>
  );
}
