import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../utils/api.js";
import {
  Droplet,
  Users,
  Search,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  Activity,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Filter,
  Layers,
  Sparkles,
  Building2,
  X,
} from "lucide-react";

export function BloodBankPage() {
  const { patients } = useOutletContext();
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "donors" | "requests" | "compatibility" | "history"

  // Data states
  const [inventoryData, setInventoryData] = useState({ inventory: [], summary: {}, bloodGroups: [] });
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState("");
  const [donors, setDonors] = useState([]);
  const [donorFilterType, setDonorFilterType] = useState("");
  const [donorSearchQuery, setDonorSearchQuery] = useState("");
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedCompatibilityType, setSelectedCompatibilityType] = useState("O+");
  const [compatibilityInfo, setCompatibilityInfo] = useState(null);

  // Modals
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockForm, setStockForm] = useState({ facilityId: "", bloodType: "O+", unitsChange: 1, action: "add" });

  const [showDonorModal, setShowDonorModal] = useState(false);
  const [donorForm, setDonorForm] = useState({
    name: "",
    phone: "",
    bloodType: "O+",
    age: 28,
    gender: "male",
    village: "Rampur",
    isWilling: true,
  });

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    patientId: "",
    patientName: "",
    facilityId: "",
    bloodType: "O+",
    unitsNeeded: 1,
    urgency: "urgent",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  // Load Initial Data
  const loadInventory = async () => {
    try {
      const url = selectedFacilityFilter ? `/bloodbank/inventory?facilityId=${selectedFacilityFilter}` : "/bloodbank/inventory";
      const res = await api.get(url);
      if (res.data?.data) {
        setInventoryData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDonors = async () => {
    try {
      let url = "/bloodbank/donors";
      const params = new URLSearchParams();
      if (donorFilterType) params.append("bloodType", donorFilterType);
      if (donorSearchQuery) params.append("village", donorSearchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data?.data) setDonors(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await api.get("/bloodbank/requests");
      if (res.data?.data) setRequests(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get("/bloodbank/history");
      if (res.data?.data) setHistory(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCompatibility = async (bg) => {
    try {
      const res = await api.get(`/bloodbank/compatibility/${encodeURIComponent(bg)}`);
      if (res.data?.data) setCompatibilityInfo(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadFacilities = async () => {
    try {
      const res = await api.get("/dashboard/facilities");
      if (res.data?.data) {
        setFacilities(res.data.data);
        if (res.data.data[0]) {
          setStockForm((prev) => ({ ...prev, facilityId: res.data.data[0]._id }));
          setRequestForm((prev) => ({ ...prev, facilityId: res.data.data[0]._id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFacilities();
    loadInventory();
    loadDonors();
    loadRequests();
    loadHistory();
    loadCompatibility(selectedCompatibilityType);
  }, []);

  useEffect(() => {
    loadInventory();
  }, [selectedFacilityFilter]);

  useEffect(() => {
    loadDonors();
  }, [donorFilterType, donorSearchQuery]);

  useEffect(() => {
    if (selectedCompatibilityType) loadCompatibility(selectedCompatibilityType);
  }, [selectedCompatibilityType]);

  // Handlers
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/bloodbank/inventory", stockForm);
      setShowStockModal(false);
      setActionSuccess(`Updated ${stockForm.bloodType} stock successfully!`);
      setTimeout(() => setActionSuccess(""), 4000);
      await loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDonor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/bloodbank/donors", donorForm);
      setShowDonorModal(false);
      setActionSuccess(`Registered ${donorForm.name} (${donorForm.bloodType}) to Community Donor Registry!`);
      setTimeout(() => setActionSuccess(""), 4000);
      setDonorForm({ name: "", phone: "", bloodType: "O+", age: 28, gender: "male", village: "Rampur", isWilling: true });
      await loadDonors();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to register donor");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/bloodbank/requests", requestForm);
      setShowRequestModal(false);
      const matched = res.data?.data?.matchedCount || 0;
      setActionSuccess(`Created Request: Auto-matched ${matched} compatible donors!`);
      setTimeout(() => setActionSuccess(""), 4000);
      await loadRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create blood request");
    } finally {
      setLoading(false);
    }
  };

  const handleFulfillRequest = async (requestId, donorId) => {
    if (!window.confirm("Confirm blood unit transfusion / fulfillment?")) return;
    try {
      await api.patch(`/bloodbank/requests/${requestId}/fulfill`, { donorId, unitsFulfilled: 1 });
      setActionSuccess("Blood request marked as fulfilled & donation history logged!");
      setTimeout(() => setActionSuccess(""), 4000);
      await loadRequests();
      await loadHistory();
      await loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || "Fulfillment failed");
    }
  };

  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-[#1f2229] text-white p-7 rounded-3xl border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 block mb-1">
            Emergency Care & Community Life-Support · Module 3.11
          </span>
          <h2 className="text-3xl font-serif font-bold text-white tracking-tight">
            Rural Blood Bank & Community Donor Grid
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
            Real-time blood stock tracking across PHC/District tiers with automated donor matching for hemorrhage & trauma emergencies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setShowDonorModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Donor</span>
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Droplet className="w-3.5 h-3.5 text-rose-400" />
            <span>Request Blood</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D3D4C0] pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "inventory", label: "Inventory Stock", icon: Droplet, count: Object.values(inventoryData.summary || {}).reduce((a, b) => a + b, 0) + " Units" },
          { id: "donors", label: "Community Donors", icon: Users, count: donors.length },
          { id: "requests", label: "Clinical Requests", icon: Activity, count: requests.filter((r) => r.status !== "fulfilled").length + " Active" },
          { id: "compatibility", label: "Compatibility Matrix", icon: Layers },
          { id: "history", label: "Donation Logs", icon: Clock, count: history.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-none shrink-0 ${
                isActive
                  ? "bg-[#1f2229] text-white shadow-xs font-serif"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-[#FAF7F2] border border-[#D3D4C0]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-rose-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Inventory Dashboard */}
      {activeTab === "inventory" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#D3D4C0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-700">Filter Facility:</span>
              <select
                value={selectedFacilityFilter}
                onChange={(e) => setSelectedFacilityFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl text-xs font-semibold"
              >
                <option value="">All Care Tiers (Aggregated)</option>
                {facilities.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.tier})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowStockModal(true)}
              className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border-none self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Update Stock</span>
            </button>
          </div>

          {/* 8 Blood Groups Visual Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {BLOOD_GROUPS.map((bg) => {
              const totalUnits = inventoryData.summary?.[bg] || 0;
              const isCritical = totalUnits === 0;
              const isLow = totalUnits > 0 && totalUnits < 3;

              return (
                <div
                  key={bg}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                    isCritical
                      ? "bg-rose-50 border-rose-300 text-rose-900 shadow-2xs"
                      : isLow
                      ? "bg-amber-50 border-amber-300 text-amber-900"
                      : "bg-white border-[#D3D4C0] text-slate-800"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-serif font-black text-lg mb-1">
                    {bg}
                  </div>
                  <span className="text-2xl font-serif font-bold text-slate-900 mt-1">{totalUnits}</span>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Units in Grid</span>

                  <span
                    className={`mt-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                      isCritical
                        ? "bg-rose-600 text-white"
                        : isLow
                        ? "bg-amber-200 text-amber-900"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isCritical ? "Stock Out" : isLow ? "Low Stock" : "Adequate"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detailed Facility Breakdown Table */}
          <div className="bg-white rounded-3xl border border-[#D3D4C0] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#D3D4C0] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Facility-wise Inventory Ledger</h3>
                <p className="text-xs text-slate-500 font-sans">Stock verification and cold storage status</p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800">Verified by ABDM Network</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#D3D4C0] text-[10px] font-mono uppercase font-bold text-slate-600">
                    <th className="p-4">Facility / Location</th>
                    <th className="p-4">Tier</th>
                    <th className="p-4">Blood Group</th>
                    <th className="p-4">Available Units</th>
                    <th className="p-4">Threshold</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D3D4C0]/50">
                  {inventoryData.inventory?.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400 font-mono">
                        No blood inventory recorded yet.
                      </td>
                    </tr>
                  ) : (
                    inventoryData.inventory.map((item) => (
                      <tr key={item._id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="p-4 font-bold text-slate-900">
                          {item.facility?.name || "Facility"}
                          <div className="text-[10px] font-mono text-slate-500 font-normal">
                            {item.facility?.location?.village || "Pune"} · {item.facility?.contactPhone}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold rounded uppercase">
                            {item.facility?.tier || "phc"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold font-mono text-xs flex items-center justify-center">
                            {item.bloodType}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-sm text-slate-900">{item.unitsAvailable}</td>
                        <td className="p-4 font-mono text-slate-500">{item.minimumThreshold || 3}</td>
                        <td className="p-4">
                          {item.unitsAvailable === 0 ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded uppercase font-mono">
                              Depleted
                            </span>
                          ) : item.unitsAvailable < (item.minimumThreshold || 3) ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase font-mono">
                              Low
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase font-mono">
                              Ready
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setStockForm({
                                facilityId: item.facility?._id,
                                bloodType: item.bloodType,
                                unitsChange: 1,
                                action: "add",
                              });
                              setShowStockModal(true);
                            }}
                            className="px-2.5 py-1 bg-white border border-[#D3D4C0] hover:bg-[#FAF7F2] text-teal-800 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          >
                            + Stock
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Community Donor Registry */}
      {activeTab === "donors" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Search & Filter Header */}
          <div className="bg-white p-5 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search village, name, or phone..."
                  value={donorSearchQuery}
                  onChange={(e) => setDonorSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={donorFilterType}
                  onChange={(e) => setDonorFilterType(e.target.value)}
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl text-xs font-semibold"
                >
                  <option value="">All Blood Groups</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowDonorModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Community Donor</span>
            </button>
          </div>

          {/* Donors Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs font-mono bg-white rounded-3xl border border-[#D3D4C0]">
                No community donors found matching filters.
              </div>
            ) : (
              donors.map((d) => (
                <div
                  key={d._id}
                  className="bg-white p-5 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col justify-between gap-4 text-xs hover:border-teal-700/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-serif font-black text-xl flex items-center justify-center shrink-0">
                        {d.bloodType}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-slate-900">{d.name}</h4>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {d.age} yrs · {d.gender} · {d.village}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        d.isWilling && d.isEligible ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {d.isWilling ? "Willing" : "Unavailable"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-3 border-t border-[#D3D4C0]/50">
                    <div className="flex items-center gap-1 text-slate-700 font-bold">
                      <Phone className="w-3.5 h-3.5 text-teal-800" />
                      <span>{d.phone}</span>
                    </div>

                    <a
                      href={`tel:${d.phone}`}
                      className="px-3 py-1 bg-[#FAF7F2] hover:bg-teal-50 text-teal-900 border border-[#D3D4C0] rounded-lg text-xs font-bold transition-all text-decoration-none"
                    >
                      Call Donor
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Clinical Blood Requests */}
      {activeTab === "requests" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">Active Emergency & Urgent Blood Requests</h3>
              <p className="text-xs text-slate-500 font-sans">
                Automatic compatibility matching against the donor network and facility inventory.
              </p>
            </div>

            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 bg-[#1f2229] hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>Raise Blood Request</span>
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-mono bg-white rounded-3xl border border-[#D3D4C0]">
                No blood requests found.
              </div>
            ) : (
              requests.map((req) => {
                const isFulfilled = req.status === "fulfilled";
                const isEmergency = req.urgency === "emergency";

                return (
                  <div
                    key={req._id}
                    className={`p-6 rounded-3xl border shadow-xs flex flex-col gap-4 text-xs transition-all ${
                      isEmergency
                        ? "bg-rose-50/50 border-rose-300"
                        : isFulfilled
                        ? "bg-[#FAF7F2] border-[#D3D4C0] opacity-80"
                        : "bg-white border-[#D3D4C0]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D3D4C0]/60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white font-serif font-black text-lg flex items-center justify-center shrink-0">
                          {req.bloodType}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-base text-slate-900">{req.patientName}</h4>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold rounded">
                              {req.requestCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Required at: {req.facility?.name || "Hospital"} · Units Needed: <strong>{req.unitsNeeded}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                            req.urgency === "emergency"
                              ? "bg-rose-600 text-white animate-pulse"
                              : req.urgency === "urgent"
                              ? "bg-amber-200 text-amber-900"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {req.urgency}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isFulfilled ? "bg-emerald-100 text-emerald-800" : "bg-teal-100 text-teal-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    </div>

                    {/* Matched Donors Section */}
                    {req.matchedDonors?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1.5 text-teal-900">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Auto-Matched Compatible Donors ({req.matchedDonors.length} nearby)</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                          {req.matchedDonors.map((md) => (
                            <div
                              key={md._id}
                              className="p-3 bg-white border border-[#D3D4C0] rounded-2xl flex flex-col justify-between gap-2 shadow-2xs"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <strong className="text-slate-900 text-xs">{md.name}</strong>
                                  <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 font-mono text-[10px] font-bold rounded">
                                    {md.bloodType}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">{md.village}</div>
                              </div>

                              {!isFulfilled && (
                                <button
                                  onClick={() => handleFulfillRequest(req._id, md._id)}
                                  className="w-full py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold cursor-pointer border-none transition-all"
                                >
                                  Accept & Transfuse
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {req.notes && (
                      <p className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-[#D3D4C0]/50">
                        <strong>Clinical Note:</strong> {req.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Compatibility Matrix */}
      {activeTab === "compatibility" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Left Interactive Picker (5 cols) */}
          <div className="lg:col-span-5 bg-white p-7 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col gap-5">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-teal-800 tracking-wider">
                ABO & Rh Transfusion Rules
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-900 tracking-tight mt-1">
                Select Patient's Blood Group
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Click any blood group to inspect compatible donors and safe recipients.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedCompatibilityType(bg)}
                  className={`p-3 rounded-2xl font-serif font-black text-lg transition-all cursor-pointer border ${
                    selectedCompatibilityType === bg
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs scale-105"
                      : "bg-[#FAF7F2] text-slate-800 border-[#D3D4C0] hover:bg-rose-50"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            {compatibilityInfo && (
              <div className="p-4 bg-[#1f2229] text-white rounded-2xl flex flex-col gap-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-rose-400 font-bold text-sm">{compatibilityInfo.bloodType}</span>
                  <span className="text-[10px] text-slate-400">
                    {compatibilityInfo.isUniversalRecipient
                      ? "UNIVERSAL RECIPIENT"
                      : compatibilityInfo.isUniversalDonor
                      ? "UNIVERSAL DONOR"
                      : "STANDARD RECIPIENT"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Safe to Receive From (Donors):
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {compatibilityInfo.canReceiveFrom?.map((d) => (
                      <span key={d} className="px-2 py-0.5 bg-emerald-900 text-emerald-300 rounded font-bold">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Can Safely Donate To:
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {compatibilityInfo.canDonateTo?.map((r) => (
                      <span key={r} className="px-2 py-0.5 bg-teal-900 text-teal-300 rounded font-bold">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Reference Matrix Table (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col gap-4 text-xs">
            <h3 className="font-serif font-bold text-lg text-slate-900">Universal ABO/Rh Compatibility Guide</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-[11px]">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#D3D4C0] text-[10px] text-slate-600">
                    <th className="p-2.5 font-bold">Recipient</th>
                    <th className="p-2.5 font-bold text-emerald-800">Compatible Donors</th>
                    <th className="p-2.5 font-bold text-teal-800">Can Donate To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D3D4C0]/50">
                  {[
                    { bg: "O-", donors: "O- only", recipients: "All Blood Types (Universal)" },
                    { bg: "O+", donors: "O+, O-", recipients: "O+, A+, B+, AB+" },
                    { bg: "A-", donors: "A-, O-", recipients: "A-, A+, AB-, AB+" },
                    { bg: "A+", donors: "A+, A-, O+, O-", recipients: "A+, AB+" },
                    { bg: "B-", donors: "B-, O-", recipients: "B-, B+, AB-, AB+" },
                    { bg: "B+", donors: "B+, B-, O+, O-", recipients: "B+, AB+" },
                    { bg: "AB-", donors: "AB-, A-, B-, O-", recipients: "AB-, AB+" },
                    { bg: "AB+", donors: "All Blood Types (Universal)", recipients: "AB+ only" },
                  ].map((row) => (
                    <tr
                      key={row.bg}
                      className={`hover:bg-[#FAF7F2] transition-colors ${
                        selectedCompatibilityType === row.bg ? "bg-rose-50 font-bold" : ""
                      }`}
                    >
                      <td className="p-2.5 font-serif font-black text-sm text-slate-900">{row.bg}</td>
                      <td className="p-2.5 text-emerald-800">{row.donors}</td>
                      <td className="p-2.5 text-slate-700">{row.recipients}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Donation Logs */}
      {activeTab === "history" && (
        <div className="bg-white rounded-3xl border border-[#D3D4C0] shadow-xs p-6 flex flex-col gap-4 animate-fadeIn">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">Transfusion & Donation Audit Log</h3>
            <p className="text-xs text-slate-500 font-sans">
              Cryptographically timestamped record of blood units dispensed and transfused.
            </p>
          </div>

          <div className="divide-y divide-[#D3D4C0]/50 text-xs">
            {history.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-mono">No donation logs recorded yet.</div>
            ) : (
              history.map((h) => (
                <div key={h._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 font-serif font-bold text-sm flex items-center justify-center">
                      {h.bloodType}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        Donor: <span className="text-teal-900">{h.donorName || "Volunteer"}</span> → Patient:{" "}
                        <span className="text-slate-900">{h.patientName || "Emergency Transfusion"}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {h.facilityName || "District Hospital"} · {h.unitsDonated} Unit(s)
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 self-start sm:self-auto">
                    {new Date(h.donatedAt || h.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Update Stock */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#D3D4C0] max-w-md w-full p-6 flex flex-col gap-4 text-xs shadow-xl text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#D3D4C0]">
              <h3 className="font-serif font-bold text-lg text-slate-900">Update Facility Blood Stock</h3>
              <button onClick={() => setShowStockModal(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Select Facility</label>
                <select
                  value={stockForm.facilityId}
                  onChange={(e) => setStockForm({ ...stockForm, facilityId: e.target.value })}
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-medium"
                >
                  {facilities.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Blood Group</label>
                  <select
                    value={stockForm.bloodType}
                    onChange={(e) => setStockForm({ ...stockForm, bloodType: e.target.value })}
                    className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-bold text-rose-800"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Action</label>
                  <select
                    value={stockForm.action}
                    onChange={(e) => setStockForm({ ...stockForm, action: e.target.value })}
                    className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-medium"
                  >
                    <option value="add">+ Add Received Units</option>
                    <option value="deduct">- Deduct Dispensed Units</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Number of Units</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={stockForm.unitsChange}
                  onChange={(e) => setStockForm({ ...stockForm, unitsChange: parseInt(e.target.value, 10) || 1 })}
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1f2229] hover:bg-teal-900 text-white font-bold rounded-xl cursor-pointer border-none mt-2 transition-all"
              >
                {loading ? "Updating..." : "Save Inventory Update"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Register Donor */}
      {showDonorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#D3D4C0] max-w-md w-full p-6 flex flex-col gap-4 text-xs shadow-xl text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#D3D4C0]">
              <h3 className="font-serif font-bold text-lg text-slate-900">Register Community Blood Donor</h3>
              <button onClick={() => setShowDonorModal(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterDonor} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh More"
                  value={donorForm.name}
                  onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98220..."
                    value={donorForm.phone}
                    onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                    className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Blood Group</label>
                  <select
                    value={donorForm.bloodType}
                    onChange={(e) => setDonorForm({ ...donorForm, bloodType: e.target.value })}
                    className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-bold text-rose-800"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Village / Locality</label>
                  <input
                    type="text"
                    value={donorForm.village}
                    onChange={(e) => setDonorForm({ ...donorForm, village: e.target.value })}
                    className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-sans"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Age (18-65)</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={donorForm.age}
                    onChange={(e) => setDonorForm({ ...donorForm, age: parseInt(e.target.value, 10) || 28 })}
                    className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer border-none mt-2 transition-all"
              >
                {loading ? "Registering..." : "Add to Volunteer Donor Grid"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Raise Blood Request */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#D3D4C0] max-w-md w-full p-6 flex flex-col gap-4 text-xs shadow-xl text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#D3D4C0]">
              <h3 className="font-serif font-bold text-lg text-slate-900">Issue Urgent Blood Request</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Select Patient / Enter Name</label>
                <select
                  value={requestForm.patientId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const p = patients?.find((item) => item._id === selId);
                    setRequestForm({
                      ...requestForm,
                      patientId: selId,
                      patientName: p ? p.name : "",
                      bloodType: p?.bloodGroup || requestForm.bloodType,
                    });
                  }}
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-medium"
                >
                  <option value="">-- Or enter custom name below --</option>
                  {patients?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.bloodGroup || "O+"} · {p.village})
                    </option>
                  ))}
                </select>
                {!requestForm.patientId && (
                  <input
                    type="text"
                    required
                    placeholder="Patient Name (e.g. Acute Trauma Victim)"
                    value={requestForm.patientName}
                    onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                    className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl mt-1"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Blood Group Needed</label>
                  <select
                    value={requestForm.bloodType}
                    onChange={(e) => setRequestForm({ ...requestForm, bloodType: e.target.value })}
                    className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-bold text-rose-800"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Urgency</label>
                  <select
                    value={requestForm.urgency}
                    onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                    className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl font-semibold"
                  >
                    <option value="routine">Routine (Scheduled)</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency SOS</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Clinical Reason & Location</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Severe postpartum hemorrhage in labor room"
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1f2229] hover:bg-rose-900 text-white font-bold rounded-xl cursor-pointer border-none mt-2 transition-all"
              >
                {loading ? "Matching Donors..." : "Broadcast & Auto-Match Donors"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
