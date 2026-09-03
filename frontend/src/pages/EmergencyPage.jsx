import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../utils/api.js";
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Phone,
  Radio,
} from "lucide-react";

export function EmergencyPage() {
  const { patients, activePatient } = useOutletContext();
  const [patientId, setPatientId] = useState(activePatient?._id || "");
  const [emergencyType, setEmergencyType] = useState("Obstetric Emergency (Hemorrhage / Pre-Eclampsia)");
  const [landmark, setLandmark] = useState("Near Rampur Gram Panchayat Water Tank");
  const [notes, setNotes] = useState("Patient is conscious but losing blood. 108 ambulance required urgently.");
  const [triggering, setTriggering] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [activeEmergencies, setActiveEmergencies] = useState([]);

  const loadEmergencies = async () => {
    try {
      const res = await api.get("/emergency/active");
      if (res.data?.data) setActiveEmergencies(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadEmergencies();
  }, []);

  const handleTriggerSOS = async (e) => {
    e.preventDefault();
    setTriggering(true);
    try {
      const res = await api.post("/emergency/sos", {
        patientId,
        emergencyType,
        landmark,
        notes,
        latitude: 18.7512,
        longitude: 73.4021,
      });
      setSosResult(res.data.data);
      await loadEmergencies();
    } catch (err) {
      alert(err.response?.data?.message || "Emergency dispatch failed");
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto text-left font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
            Module 3.10 · Fast-Track Dispatch
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            108 Emergency Ambulance Escalation
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Bypasses all standard clinical queues. Dispatches nearest 108 ambulance and activates trauma bay at District Hospital.
          </p>
        </div>

        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs">
          <Radio className="w-4 h-4 text-rose-400" />
          <span>Ambulance Telemetry Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left SOS Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
          <form onSubmit={handleTriggerSOS} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col items-center justify-center p-6 bg-rose-50 rounded-2xl border border-rose-200 gap-3">
              <button
                type="submit"
                disabled={triggering}
                className="w-24 h-24 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center justify-center gap-1 shadow-md hover:scale-105 transition-all cursor-pointer border-none"
              >
                <ShieldAlert className="w-8 h-8 text-white" />
                <span className="text-[11px] font-bold tracking-wider uppercase">1-TAP SOS</span>
              </button>
              <span className="text-xs font-mono text-rose-900 font-bold">
                {triggering ? "BROADCASTING EMERGENCY DISPATCH..." : "Tap to Trigger Immediate 108 Emergency Dispatch"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">Select Patient / Victim</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold font-sans"
              >
                <option value="">-- Anonymous / Roadside Incident --</option>
                {patients?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.village} · ABHA: {p.abhaId})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">Incident Category</label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold font-sans"
              >
                <option value="Obstetric Emergency (Hemorrhage / Pre-Eclampsia)">Obstetric Emergency (Hemorrhage / Eclampsia / Labor)</option>
                <option value="Acute Trauma / Road Traffic Accident">Acute Trauma / Road Traffic Accident</option>
                <option value="Acute Coronary Syndrome (Heart Attack)">Acute Coronary Syndrome (Heart Attack / Stroke)</option>
                <option value="Pediatric Severe Respiratory Distress">Pediatric Severe Respiratory Distress / Convulsion</option>
                <option value="Snakebite / Acute Poisoning">Snakebite / Acute Poisoning Envenomation</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Pickup Landmark / Village Location</span>
              </label>
              <input
                type="text"
                required
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">Immediate Instructions</label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-sans"
              />
            </div>
          </form>

          {sosResult && (
            <div className="p-4 bg-slate-900 text-white border border-slate-800 rounded-xl flex flex-col gap-2 keep-note animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                <span>108 FLEET DISPATCHED · SOS CODE: {sosResult.sosCode}</span>
              </div>
              <div className="text-xs text-slate-300 font-mono">
                Destination: <strong>{sosResult.destinationFacility?.name}</strong> · ETA: ~{sosResult.etaMinutes} mins
              </div>
              <div className="text-[11px] text-slate-400">
                Hospital emergency reception notified. All standard queues bypassed.
              </div>
            </div>
          )}
        </div>

        {/* Right Active Emergency Stream */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Active High-Priority Escalations</span>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-mono font-bold rounded">
                {activeEmergencies.length} Active
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {activeEmergencies.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-mono">
                  No active red-alert emergencies currently in transit.
                </div>
              ) : (
                activeEmergencies.map((em) => (
                  <div
                    key={em._id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <strong className="text-slate-900">{em.patient?.name || "Emergency Patient"}</strong>
                      <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[9px] font-mono font-bold uppercase">
                        {em.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium leading-tight">
                      {em.reason}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                      <span>Destination: {em.toFacility?.name?.split(" ")[0] || "Hospital"}</span>
                      <span>108 Ambulance</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
