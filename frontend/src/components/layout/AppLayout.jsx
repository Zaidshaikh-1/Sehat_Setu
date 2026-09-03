import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { TopBar } from "./TopBar.jsx";
import { api } from "../../utils/api.js";
import { getSocket } from "../../utils/socket.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export function AppLayout() {
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [realtimeAlert, setRealtimeAlert] = useState(null);
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      if (res.data?.data) {
        setPatients(res.data.data);
        if (!activePatient && res.data.data.length > 0) {
          setActivePatient(res.data.data[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch patients", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPatients();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const socket = getSocket();

    const handleReferralUpdate = (data) => {
      setRealtimeAlert({
        title: "Referral Milestone Synchronized",
        message: `Referral ${data.referralCode || data.referral?.referralCode} moved to: ${data.newStatus?.toUpperCase() || "UPDATED"}`,
        type: "referral",
      });
      setTimeout(() => setRealtimeAlert(null), 5000);
      fetchPatients();
    };

    const handleEmergencyAlert = (data) => {
      setRealtimeAlert({
        title: "108 EMERGENCY SOS TRIGGERED",
        message: `Patient: ${data.patientName} (${data.village}) — Ambulance corridor activated.`,
        type: "emergency",
      });
      setTimeout(() => setRealtimeAlert(null), 8000);
      fetchPatients();
    };

    socket.on("referralUpdated", handleReferralUpdate);
    socket.on("emergencyAlert", handleEmergencyAlert);

    return () => {
      socket.off("referralUpdated", handleReferralUpdate);
      socket.off("emergencyAlert", handleEmergencyAlert);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] font-sans text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-teal-700 border-t-transparent animate-spin" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Setu Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF7F2] font-sans text-slate-800">
      {/* Real-time Toast Alert */}
      {realtimeAlert && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl flex items-start gap-3 border animate-fadeIn max-w-sm ${
            realtimeAlert.type === "emergency"
              ? "bg-rose-950 text-white border-rose-600"
              : "bg-slate-900 text-white border-teal-500"
          }`}
        >
          {realtimeAlert.type === "emergency" ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          )}
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold font-mono uppercase tracking-wider">{realtimeAlert.title}</span>
            <span className="text-xs text-slate-300 mt-0.5 leading-snug">{realtimeAlert.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation (Heidi Style) */}
      <Sidebar
        patients={patients}
        activePatientId={activePatient?._id}
        onSelectPatient={(p) => setActivePatient(p)}
        onNewTriage={() => navigate("/triage")}
      />

      {/* Main Console Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#FAF7F2]">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF7F2]">
          <Outlet context={{ patients, activePatient, setActivePatient, refreshPatients: fetchPatients }} />
        </main>
      </div>
    </div>
  );
}
