import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../utils/api.js";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Plus,
  ArrowRight,
  MessageSquare,
  Building,
} from "lucide-react";

export function AppointmentsPage() {
  const { patients } = useOutletContext();
  const [appointments, setAppointments] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [loading, setLoading] = useState(true);

  const [bookingModal, setBookingModal] = useState(false);
  const [bookData, setBookData] = useState({
    patientId: "",
    facilityId: "",
    department: "General Medicine OPD",
    type: "in-person-opd",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [facRes, appRes] = await Promise.all([
        api.get("/dashboard/facilities"),
        api.get("/appointments"),
      ]);
      if (facRes.data?.data) {
        setFacilities(facRes.data.data);
        if (!selectedFacilityId && facRes.data.data.length > 0) {
          setSelectedFacilityId(facRes.data.data[1]?._id || facRes.data.data[0]._id);
          setBookData((prev) => ({ ...prev, facilityId: facRes.data.data[1]?._id || facRes.data.data[0]._id }));
        }
      }
      if (appRes.data?.data) {
        setAppointments(appRes.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookToken = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/appointments/book", bookData);
      setBookingModal(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to book token");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const currentFacility = facilities.find((f) => f._id === selectedFacilityId) || facilities[0];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Module 3.2 · Crowd Balancing
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Virtual Queue & OPD Token Slots
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Load-aware token booking with estimated wait windows and automated SMS arrival alerts.
          </p>
        </div>

        <button
          onClick={() => setBookingModal(true)}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Virtual Token</span>
        </button>
      </div>

      {/* Facility Load Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {facilities.map((fac) => {
          const isSelected = fac._id === selectedFacilityId;
          const crowdBadge =
            fac.crowdLevel === "high"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : fac.crowdLevel === "moderate"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200";

          return (
            <div
              key={fac._id}
              onClick={() => setSelectedFacilityId(fac._id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between gap-3 ${
                isSelected
                  ? "bg-teal-50/50 border-teal-600 shadow-xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">{fac.tier}</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">{fac.name}</h4>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase ${crowdBadge}`}>
                  {fac.crowdLevel || "Moderate"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                <span>Available Beds: <strong>{fac.availableBeds || 6}/{fac.totalBeds || 12}</strong></span>
                <span>{fac.location?.village || "Pune"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Queue Token List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-slate-900">
              Live Queue at {currentFacility?.name || "Khandala PHC"}
            </h3>
            <span className="text-[10px] font-mono text-teal-700 uppercase font-semibold">
              Today's OPD Register
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {appointments.length} Total Patients Queued
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {appointments.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs font-sans">
              No active queue tokens generated for this facility today.
            </div>
          ) : (
            appointments.map((app) => {
              const statusColor =
                app.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : app.status === "checked-in"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-teal-50 text-teal-800 border-teal-200";

              return (
                <div
                  key={app._id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3 text-left shadow-xs"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                        #{app.tokenNumber}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${statusColor}`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-col mt-1">
                      <strong className="text-xs text-slate-900">{app.patient?.name || "Patient"}</strong>
                      <span className="text-[10.5px] text-slate-500 font-mono">
                        ABHA: {app.patient?.abhaId} · {app.patient?.village}
                      </span>
                      <span className="text-[10.5px] text-teal-800 font-semibold mt-0.5">
                        {app.department}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-600 mt-1">
                      <span>Wait: ~{app.estimatedWaitMinutes}m</span>
                      <span>Slot: {app.slotTime?.split("(")[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    {app.status === "scheduled" && (
                      <button
                        onClick={() => handleStatusChange(app._id, "checked-in")}
                        className="flex-1 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs rounded-lg cursor-pointer border-none"
                      >
                        Check-In Patient
                      </button>
                    )}
                    {app.status === "checked-in" && (
                      <button
                        onClick={() => handleStatusChange(app._id, "completed")}
                        className="flex-1 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-lg cursor-pointer border-none"
                      >
                        Mark Completed
                      </button>
                    )}
                    {app.status === "completed" && (
                      <span className="text-emerald-700 text-xs font-mono font-bold">Encounter Finished</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-left animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Issue Virtual Queue Token</h3>
              <button
                onClick={() => setBookingModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookToken} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Select Patient</label>
                <select
                  required
                  value={bookData.patientId}
                  onChange={(e) => setBookData({ ...bookData, patientId: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-sans"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.village})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Target Facility</label>
                <select
                  required
                  value={bookData.facilityId}
                  onChange={(e) => setBookData({ ...bookData, facilityId: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-sans"
                >
                  {facilities.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Department / OPD</label>
                <select
                  value={bookData.department}
                  onChange={(e) => setBookData({ ...bookData, department: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-sans"
                >
                  <option value="General Medicine OPD">General Medicine OPD</option>
                  <option value="Antenatal Care Special Clinic">Antenatal Care Special Clinic</option>
                  <option value="NCD & Hypertension Clinic">NCD & Hypertension Clinic</option>
                  <option value="Pediatric Immunization Hub">Pediatric Immunization Hub</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-[11px] leading-tight flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Automatic SMS notification with token arrival window will be dispatched to patient phone.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg cursor-pointer border-none"
                >
                  {submitting ? "Booking Token..." : "Issue Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
