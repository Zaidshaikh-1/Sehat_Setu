import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../utils/api.js";
import {
  Users,
  Search,
  Plus,
  Activity,
  HeartPulse,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Stethoscope,
  Filter,
} from "lucide-react";

export function PatientListPage() {
  const { patients, setActivePatient, refreshPatients } = useOutletContext();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "female",
    village: "Rampur",
    phone: "",
    bloodGroup: "O+",
    conditions: "",
    isPregnant: false,
    gestationalWeeks: "",
  });
  const [creating, setCreating] = useState(false);

  const filteredPatients = (patients || []).filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(q) ||
      p.abhaId?.toLowerCase().includes(q) ||
      p.village?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterTag === "high-risk") return p.isHighRiskMaternal || p.riskTier === "high" || p.riskTier === "critical";
    if (filterTag === "anc") return p.isPregnant;
    if (filterTag === "chronic") return p.conditions?.some((c) => c.toLowerCase().includes("hypertension") || c.toLowerCase().includes("diabetes"));
    if (filterTag === "child") return p.age <= 5;
    return true;
  });

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const conditionsArray = formData.conditions
        ? formData.conditions.split(",").map((c) => c.trim())
        : [];

      const res = await api.post("/patients", {
        ...formData,
        age: Number(formData.age),
        conditions: conditionsArray,
        gestationalWeeks: formData.gestationalWeeks ? Number(formData.gestationalWeeks) : null,
      });

      setShowAddModal(false);
      setFormData({
        name: "",
        age: "",
        gender: "female",
        village: "Rampur",
        phone: "",
        bloodGroup: "O+",
        conditions: "",
        isPregnant: false,
        gestationalWeeks: "",
      });
      await refreshPatients();
      if (res.data?.data) {
        setActivePatient(res.data.data);
        navigate(`/patient/${res.data.data._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create patient");
    } finally {
      setCreating(false);
    }
  };

  const getRoleHeader = () => {
    if (role === "admin") {
      return {
        tag: "District Administrative Index",
        title: "District Community Health Registry",
        desc: "Unified patient database across all sub-centres, PHCs, and hospitals in the district.",
      };
    }
    if (role === "doctor") {
      return {
        tag: "PHC Clinical Index",
        title: "Primary Health Centre Patient Queue",
        desc: "Patients registered for OPD consultations, teleconsultations, and specialist referrals.",
      };
    }
    return {
      tag: "ASHA Field Surface",
      title: "Assigned Village Patient Registry",
      desc: "Household roster for Rampur sub-centre with high-risk pregnancy and immunization tracking.",
    };
  };

  const roleInfo = getRoleHeader();

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto font-sans text-slate-800">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-left">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 block mb-1">
            {roleInfo.tag}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {roleInfo.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {roleInfo.desc}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Patient</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: "all", label: `All Patients (${patients?.length || 0})` },
            { id: "high-risk", label: "High-Risk Cases" },
            { id: "anc", label: "Maternal ANC" },
            { id: "chronic", label: "Chronic NCD" },
            { id: "child", label: "Child Immunization" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTag(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                filterTag === tab.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, ABHA ID, village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 font-sans"
          />
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
            No patients found matching the current search or filter criteria.
          </div>
        ) : (
          filteredPatients.map((p) => {
            const isHighRisk = p.isHighRiskMaternal || p.riskTier === "high" || p.riskTier === "critical";

            return (
              <div
                key={p._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4 text-left shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                        {p.name}
                      </h3>
                      <div className="text-[11px] font-mono text-teal-700 font-semibold mt-0.5">
                        ABHA: {p.abhaId}
                      </div>
                    </div>
                    {isHighRisk ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[9px] font-bold uppercase">
                        High Risk
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[9px] font-bold uppercase">
                        {p.riskTier || "Low"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>{p.village}</span>
                    <span>·</span>
                    <span>{p.age} yrs ({p.gender})</span>
                    <span>·</span>
                    <span className="font-mono">{p.bloodGroup}</span>
                  </div>

                  {/* Conditions Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {p.conditions?.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-50 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Latest Vitals Strip */}
                  {p.vitalsLatest && (
                    <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[10px] font-mono text-slate-700">
                      <span>BP: <strong>{p.vitalsLatest.systolicBP ? `${p.vitalsLatest.systolicBP}/${p.vitalsLatest.diastolicBP}` : "120/80"}</strong></span>
                      <span>SpO2: <strong>{p.vitalsLatest.spO2 || 98}%</strong></span>
                      <span>Hb: <strong>{p.vitalsLatest.hemoglobin || 11.2} g/dL</strong></span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setActivePatient(p);
                      navigate(`/triage/${p._id}`);
                    }}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200 flex items-center justify-center gap-1"
                  >
                    <Activity className="w-3 h-3 text-teal-600" />
                    <span>Triage</span>
                  </button>

                  <button
                    onClick={() => {
                      setActivePatient(p);
                      navigate(`/consultation/${p._id}`);
                    }}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200 flex items-center justify-center gap-1"
                  >
                    <Stethoscope className="w-3 h-3 text-teal-600" />
                    <span>Consult</span>
                  </button>

                  <button
                    onClick={() => {
                      setActivePatient(p);
                      navigate(`/patient/${p._id}`);
                    }}
                    className="py-1.5 px-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border-none flex items-center justify-center gap-1"
                  >
                    <span>Timeline</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 text-left animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enroll New Patient</h3>
                <span className="text-[10px] font-mono text-teal-700 uppercase font-semibold">
                  Generates ABHA ID & Longitudinal Record
                </span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavita Shinde"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Age (Years) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="120"
                    placeholder="e.g. 26"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 font-sans"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Village</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 font-sans"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98220 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Known Conditions (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Anemia, Past C-Section"
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 font-sans"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="pregnantCheckbox"
                  checked={formData.isPregnant}
                  onChange={(e) => setFormData({ ...formData, isPregnant: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="pregnantCheckbox" className="font-semibold text-slate-800 select-none">
                  Antenatal Care (ANC) Pregnancy Registration
                </label>
              </div>

              {formData.isPregnant && (
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Gestational Weeks (1-40)</label>
                  <input
                    type="number"
                    min="1"
                    max="42"
                    placeholder="e.g. 24"
                    value={formData.gestationalWeeks}
                    onChange={(e) => setFormData({ ...formData, gestationalWeeks: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 font-sans"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg shadow-xs transition-all cursor-pointer border-none flex items-center gap-1.5"
                >
                  {creating ? "Enrolling..." : "Enroll & Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
