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

  const FACILITY_QUEUES = {
    default: [
      {
        _id: "app-mock-1",
        tokenNumber: 4,
        tokenCode: "SETU-849102",
        patient: { name: "Sunita Devi", abhaId: "91-4829-1029-4821", village: "Rampur" },
        department: "Antenatal Care Special Clinic",
        doctorName: "Dr. Kavita Deshmukh (OB-GYN)",
        estimatedWaitMinutes: 12,
        slotTime: "10:30 AM - 10:45 AM",
        status: "scheduled",
        urgency: "HIGH",
      },
      {
        _id: "app-mock-2",
        tokenNumber: 12,
        tokenCode: "SETU-592810",
        patient: { name: "Ramesh Patil", abhaId: "91-3829-9182-5501", village: "Khandala" },
        department: "NCD & Hypertension Clinic",
        doctorName: "Dr. Rajesh Patil (General Medicine)",
        estimatedWaitMinutes: 28,
        slotTime: "11:15 AM - 11:30 AM",
        status: "checked-in",
        urgency: "MODERATE",
      },
      {
        _id: "app-mock-3",
        tokenNumber: 14,
        tokenCode: "SETU-742911",
        patient: { name: "Govind Thakur", abhaId: "91-1829-3382-7720", village: "Maval" },
        department: "Pulmonology & DOTS Screening",
        doctorName: "Dr. Prakash Sharma (MO)",
        estimatedWaitMinutes: 35,
        slotTime: "11:45 AM - 12:00 PM",
        status: "scheduled",
        urgency: "HIGH",
      },
      {
        _id: "app-mock-4",
        tokenNumber: 16,
        tokenCode: "SETU-391820",
        patient: { name: "Aarav Jadhav (Infant)", abhaId: "91-7721-0029-1192", village: "Rampur" },
        department: "Pediatrics & Immunization",
        doctorName: "Dr. Arun Mehta (Pediatrician)",
        estimatedWaitMinutes: 45,
        slotTime: "12:15 PM - 12:30 PM",
        status: "scheduled",
        urgency: "MODERATE",
      },
      {
        _id: "app-mock-5",
        tokenNumber: 19,
        tokenCode: "SETU-119284",
        patient: { name: "Laxmi Bai Shinde", abhaId: "91-6629-4412-8819", village: "Shirur" },
        department: "Orthopedic & Joint Care Clinic",
        doctorName: "Dr. Vikram Singh (Ortho)",
        estimatedWaitMinutes: 52,
        slotTime: "01:00 PM - 01:15 PM",
        status: "scheduled",
        urgency: "ROUTINE",
      },
      {
        _id: "app-mock-6",
        tokenNumber: 22,
        tokenCode: "SETU-992104",
        patient: { name: "Anita Gaikwad", abhaId: "91-4402-9912-3301", village: "Somatane" },
        department: "Dermatology & Skin Screening",
        doctorName: "Dr. Priya Kulkarni (Dermatology)",
        estimatedWaitMinutes: 65,
        slotTime: "01:30 PM - 01:45 PM",
        status: "scheduled",
        urgency: "ROUTINE",
      },
      {
        _id: "app-mock-7",
        tokenNumber: 27,
        tokenCode: "SETU-661902",
        patient: { name: "Bapu Shinde", abhaId: "91-5509-1129-8833", village: "Talegaon" },
        department: "General Medicine OPD",
        doctorName: "Dr. Prakash Sharma (MO)",
        estimatedWaitMinutes: 75,
        slotTime: "02:00 PM - 02:15 PM",
        status: "scheduled",
        urgency: "ROUTINE",
      },
    ],
  };

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
      if (appRes.data?.data && appRes.data.data.length > 0) {
        setAppointments(appRes.data.data);
      } else {
        setAppointments(FACILITY_QUEUES.default);
      }
    } catch (e) {
      console.error(e);
      setAppointments(FACILITY_QUEUES.default);
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
    // Local state update for smooth interactivity
    setAppointments((prev) =>
      prev.map((a) => (a._id === appointmentId ? { ...a, status } : a))
    );
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });
    } catch (e) {
      console.error(e);
    }
  };

  const currentFacility = facilities.find((f) => f._id === selectedFacilityId) || facilities[0];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-white p-7 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 block mb-1">
            Module 3.2 · Crowd Balancing
          </span>
          <h2 className="text-3xl font-serif font-bold text-[#1f2229] tracking-tight">
            Virtual Queue & OPD Token Slots
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-sans">
            Load-aware token booking with estimated wait windows and automated SMS arrival alerts.
          </p>
        </div>

        <button
          onClick={() => setBookingModal(true)}
          className="px-5 py-3 bg-[#1f2229] hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none shrink-0"
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
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : fac.crowdLevel === "moderate"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200";

          return (
            <div
              key={fac._id}
              onClick={() => setSelectedFacilityId(fac._id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between gap-3 ${
                isSelected
                  ? "bg-[#F3E4C9]/40 border-teal-800 shadow-2xs"
                  : "bg-white border-[#D3D4C0] hover:bg-[#FAF7F2]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">{fac.tier}</span>
                  <h4 className="text-sm font-serif font-bold text-slate-900 mt-0.5">{fac.name}</h4>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border uppercase ${crowdBadge}`}>
                  {fac.crowdLevel || "Moderate"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-500 pt-2 border-t border-[#D3D4C0]/50">
                <span>Available Beds: <strong>{fac.availableBeds || 6}/{fac.totalBeds || 12}</strong></span>
                <span>{fac.location?.village || "Pune"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Queue Token List */}
      <div className="bg-white rounded-3xl border border-[#D3D4C0] p-7 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D3D4C0]/60">
          <div className="flex flex-col">
            <h3 className="text-xl font-serif font-bold text-slate-900">
              Live Queue at {currentFacility?.name || "Khandala PHC"}
            </h3>
            <span className="text-[10px] font-mono text-teal-800 uppercase font-semibold">
              Today's OPD Register
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {appointments.length} Total Patients Queued
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {appointments.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs font-sans">
              No active queue tokens generated for this facility today.
            </div>
          ) : (
            appointments.map((app) => {
              const statusColor =
                app.status === "completed"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : app.status === "checked-in"
                  ? "bg-purple-50 text-purple-800 border-purple-200"
                  : "bg-teal-50 text-teal-900 border-teal-200";

              return (
                <div
                  key={app._id}
                  className="bg-[#FAF7F2] border border-[#D3D4C0] rounded-2xl p-5 flex flex-col justify-between gap-3 text-left shadow-2xs"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#1f2229] text-white flex items-center justify-center font-mono font-bold text-xs">
                          #{app.tokenNumber}
                        </div>
                        {app.tokenCode && (
                          <span className="px-2 py-0.5 bg-slate-900 text-teal-300 rounded-md font-mono text-[9.5px] font-bold">
                            {app.tokenCode}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${statusColor}`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-col mt-1">
                      <strong className="text-sm font-serif text-slate-900">{app.patient?.name || "Patient"}</strong>
                      <span className="text-[10.5px] text-slate-500 font-mono">
                        ABHA: {app.patient?.abhaId} · {app.patient?.village}
                      </span>
                      <span className="text-[10.5px] text-teal-800 font-semibold mt-0.5">
                        {app.department}
                      </span>
                      {app.doctorName && (
                        <span className="text-[10px] text-slate-600 font-mono mt-0.5">
                          Doctor: <strong>{app.doctorName}</strong>
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-[#D3D4C0] flex items-center justify-between text-[10px] font-mono text-slate-600 mt-1">
                      <span>Wait: ~{app.estimatedWaitMinutes}m</span>
                      <span>Slot: {app.slotTime?.split("(")[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#D3D4C0]/60">
                    {app.status === "scheduled" && (
                      <button
                        onClick={() => handleStatusChange(app._id, "checked-in")}
                        className="flex-1 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs rounded-xl cursor-pointer border-none"
                      >
                        Check-In Patient
                      </button>
                    )}
                    {app.status === "checked-in" && (
                      <button
                        onClick={() => handleStatusChange(app._id, "completed")}
                        className="flex-1 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-xl cursor-pointer border-none"
                      >
                        Mark Completed
                      </button>
                    )}
                    {app.status === "completed" && (
                      <span className="text-emerald-800 text-xs font-mono font-bold">Encounter Finished</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D3D4C0] rounded-3xl max-w-md w-full p-7 shadow-2xl flex flex-col gap-4 text-left animate-fadeIn">
            <div className="flex justify-between items-center pb-3 border-b border-[#D3D4C0]">
              <h3 className="text-xl font-serif font-bold text-[#1f2229]">Issue Virtual Queue Token</h3>
              <button
                onClick={() => setBookingModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#D3D4C0] text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer"
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
                  className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-sans"
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
                  className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-sans"
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
                  className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-sans"
                >
                  <option value="General Medicine OPD">General Medicine OPD</option>
                  <option value="Antenatal Care Special Clinic">Antenatal Care Special Clinic</option>
                  <option value="NCD & Hypertension Clinic">NCD & Hypertension Clinic</option>
                  <option value="Pediatric Immunization Hub">Pediatric Immunization Hub</option>
                </select>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#D3D4C0] text-slate-700 text-[11px] leading-tight flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Automatic SMS notification with token arrival window will be dispatched to patient phone.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingModal(false)}
                  className="px-4 py-2.5 bg-[#FAF7F2] text-slate-700 font-bold rounded-xl cursor-pointer border border-[#D3D4C0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#1f2229] hover:bg-teal-900 text-white font-bold rounded-xl cursor-pointer border-none shadow-xs"
                >
                  {submitting ? "Booking..." : "Issue Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
