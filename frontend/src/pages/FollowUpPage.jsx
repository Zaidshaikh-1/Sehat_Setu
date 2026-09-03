import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Plus,
  Clock,
  Award,
} from "lucide-react";

export function FollowUpPage() {
  const { patients } = useOutletContext();
  const { user } = useAuth();

  const [worklist, setWorklist] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    highRiskCount: 0,
    todayIncentivesInr: 0,
  });
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);
  const [observations, setObservations] = useState("");
  const [followupVitals, setFollowupVitals] = useState({
    systolicBP: "124",
    diastolicBP: "82",
    bloodSugar: "118",
  });
  const [completing, setCompleting] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    patientId: "",
    type: "ANC Visit",
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    isHighRisk: false,
    incentiveAmountInr: 150,
  });
  const [creating, setCreating] = useState(false);

  const loadWorklist = async () => {
    setLoading(true);
    try {
      const res = await api.get("/followups/worklist");
      if (res.data?.data) {
        setWorklist(res.data.data.worklist || []);
        setCompletedToday(res.data.data.completedToday || []);
        setStats(res.data.data.stats || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorklist();
  }, []);

  const handleCompleteTask = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setCompleting(true);
    try {
      await api.patch(`/followups/${selectedTask._id}/complete`, {
        observations,
        vitals: {
          systolicBP: Number(followupVitals.systolicBP),
          diastolicBP: Number(followupVitals.diastolicBP),
          bloodSugar: Number(followupVitals.bloodSugar),
        },
      });
      setSelectedTask(null);
      setObservations("");
      await loadWorklist();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete follow-up");
    } finally {
      setCompleting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/followups", newTask);
      setCreateModal(false);
      setNewTask({
        patientId: "",
        type: "ANC Visit",
        title: "",
        description: "",
        dueDate: new Date().toISOString().split("T")[0],
        isHighRisk: false,
        incentiveAmountInr: 150,
      });
      await loadWorklist();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to schedule follow-up");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-white p-7 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 block mb-1">
            Module 3.8 / 3.9 · Frontline Continuity
          </span>
          <h2 className="text-3xl font-serif font-bold text-[#1f2229] tracking-tight">
            High-Risk Follow-up & ASHA Daily Worklist
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-sans">
            Daily schedule for ANC home visits, child immunization rounds, and chronic NCD compliance check-ins.
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="px-5 py-3 bg-[#1f2229] hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Follow-Up</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-5 bg-white border border-[#D3D4C0] rounded-2xl flex flex-col text-left shadow-2xs">
          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Tasks Due Today</span>
          <span className="text-3xl font-serif font-bold text-slate-900 mt-0.5">{stats.dueTodayCount || worklist.length}</span>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-2xl flex flex-col text-left shadow-2xs">
          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">High-Risk Registrations</span>
          <span className="text-3xl font-serif font-bold text-slate-900 mt-0.5">{stats.highRiskCount}</span>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-2xl flex flex-col text-left shadow-2xs">
          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Completed Today</span>
          <span className="text-3xl font-serif font-bold text-slate-900 mt-0.5">{stats.completedTodayCount}</span>
        </div>

        <div className="p-5 bg-[#F3E4C9]/50 border border-teal-800/30 rounded-2xl flex flex-col text-left shadow-2xs">
          <span className="text-[10px] font-mono text-teal-900 font-bold uppercase">ASHA Incentives Earned</span>
          <span className="text-3xl font-serif font-bold text-teal-950 mt-0.5">Rs. {user?.incentivePoints || 1850}</span>
        </div>
      </div>

      {/* Worklist Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {worklist.map((item) => {
          return (
            <div
              key={item._id}
              className={`bg-white border rounded-3xl p-6 shadow-2xs flex flex-col justify-between gap-4 text-left transition-all ${
                item.isHighRisk ? "border-rose-300 bg-rose-50/15" : "border-[#D3D4C0]"
              }`}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-teal-800 bg-[#FAF7F2] px-2.5 py-0.5 rounded-md border border-[#D3D4C0]">
                    {item.type}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-teal-900 bg-[#F3E4C9]/70 px-2.5 py-0.5 rounded-full border border-teal-800/30">
                    +Rs. {item.incentiveAmountInr || 150} Incentive
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-serif font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-snug font-sans">{item.description}</p>
                </div>

                <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D3D4C0] flex items-center justify-between text-xs font-mono text-slate-700 mt-1">
                  <div>
                    <span className="text-[9.5px] text-slate-400 block uppercase">Patient</span>
                    <strong className="text-xs text-slate-900">{item.patient?.name}</strong>
                    <span className="text-[10px] text-slate-500 block">{item.patient?.village}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] text-slate-400 block uppercase">Due Date</span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(item.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#D3D4C0]/60">
                <span className="text-[10px] text-slate-500 font-mono">Assigned: ASHA Meera</span>
                <button
                  onClick={() => {
                    setSelectedTask(item);
                    setObservations(`Home visit conducted for ${item.patient?.name}. Vitals normal, medication adherence verified.`);
                  }}
                  className="px-4 py-2 bg-[#1f2229] hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer border-none flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Log Check-in & Claim</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D3D4C0] rounded-3xl max-w-md w-full p-7 shadow-2xl flex flex-col gap-4 text-left animate-fadeIn">
            <div className="flex justify-between items-center pb-3 border-b border-[#D3D4C0]">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1f2229]">Log Home Check-in</h3>
                <span className="text-[10px] font-mono text-teal-800 uppercase font-semibold">
                  {selectedTask.patient?.name} · {selectedTask.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#D3D4C0] text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteTask} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Observations & Health Advice Provided</label>
                <textarea
                  rows="3"
                  required
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-sans"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-slate-500 font-mono">Sys BP</label>
                  <input
                    type="number"
                    value={followupVitals.systolicBP}
                    onChange={(e) => setFollowupVitals({ ...followupVitals, systolicBP: e.target.value })}
                    className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl text-xs"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-slate-500 font-mono">Dia BP</label>
                  <input
                    type="number"
                    value={followupVitals.diastolicBP}
                    onChange={(e) => setFollowupVitals({ ...followupVitals, diastolicBP: e.target.value })}
                    className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl text-xs"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-slate-500 font-mono">Sugar mg/dL</label>
                  <input
                    type="number"
                    value={followupVitals.bloodSugar}
                    onChange={(e) => setFollowupVitals({ ...followupVitals, bloodSugar: e.target.value })}
                    className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#F3E4C9]/50 border border-teal-800/30 rounded-2xl text-teal-950 text-[11px] font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-800 shrink-0" />
                <span>Submitting logs will credit Rs. {selectedTask.incentiveAmountInr || 150} to ASHA Meera's incentive registry.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2.5 bg-[#FAF7F2] text-slate-700 font-bold rounded-xl cursor-pointer border border-[#D3D4C0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completing}
                  className="px-5 py-2.5 bg-[#1f2229] hover:bg-teal-900 text-white font-bold rounded-xl cursor-pointer border-none shadow-xs"
                >
                  {completing ? "Saving..." : "Complete & Sync"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D3D4C0] rounded-3xl max-w-md w-full p-7 shadow-2xl flex flex-col gap-4 text-left animate-fadeIn">
            <div className="flex justify-between items-center pb-3 border-b border-[#D3D4C0]">
              <h3 className="text-xl font-serif font-bold text-[#1f2229]">Schedule High-Risk Follow-up</h3>
              <button
                onClick={() => setCreateModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#D3D4C0] text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Patient</label>
                <select
                  required
                  value={newTask.patientId}
                  onChange={(e) => setNewTask({ ...newTask, patientId: e.target.value })}
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
                <label className="font-semibold text-slate-700">Follow-up Program</label>
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                  className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-sans"
                >
                  <option value="ANC Visit">ANC Visit (Maternal)</option>
                  <option value="Child Immunization">Child Immunization</option>
                  <option value="Hypertension / Diabetes">Hypertension / Diabetes NCD</option>
                  <option value="TB DOTS Follow-up">TB DOTS Follow-up</option>
                  <option value="Post-Op / Discharge">Post-Op / Discharge Recovery</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3rd Trimester Hemoglobin Check"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-sans"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Due Date</label>
                <input
                  type="date"
                  required
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2.5 bg-[#FAF7F2] text-slate-700 font-bold rounded-xl cursor-pointer border border-[#D3D4C0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-[#1f2229] hover:bg-teal-900 text-white font-bold rounded-xl cursor-pointer border-none shadow-xs"
                >
                  {creating ? "Scheduling..." : "Add to Worklist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
