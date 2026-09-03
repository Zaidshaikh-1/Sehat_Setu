import React, { useState, useEffect } from "react";
import { api } from "../utils/api.js";
import {
  Pill,
  Search,
  AlertTriangle,
  CheckCircle2,
  Building,
  RefreshCw,
  Plus,
} from "lucide-react";

export function MedicinePage() {
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [restockingId, setRestockingId] = useState(null);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const [medRes, alertRes] = await Promise.all([
        api.get("/medicines"),
        api.get("/medicines/alerts"),
      ]);
      if (medRes.data?.data) setMedicines(medRes.data.data);
      if (alertRes.data?.data) setAlerts(alertRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleRestock = async (medicineId, addedQty = 200) => {
    setRestockingId(medicineId);
    try {
      await api.patch(`/medicines/${medicineId}/stock`, { addedStock: addedQty });
      await loadMedicines();
    } catch (e) {
      console.error(e);
    } finally {
      setRestockingId(null);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      m.name?.toLowerCase().includes(q) ||
      m.genericName?.toLowerCase().includes(q) ||
      m.facility?.name?.toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (categoryFilter === "all") return true;
    if (categoryFilter === "stockout") return m.isStockOut;
    return m.category === categoryFilter;
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Module 3.7 · Pharmacy Supply Chain
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pharmacy Inventory & Stock-Out Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cross-facility drug visibility allowing frontline workers to verify drug availability before patients travel.
          </p>
        </div>

        <button
          onClick={loadMedicines}
          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border-none shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stock-Out Alert Banner */}
      {alerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-rose-900 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{alerts.length} Critical Public Pharmacy Stock-Out Alerts:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {alerts.map((al) => (
              <div
                key={al._id}
                className="bg-white border border-rose-200 rounded-xl p-3 flex flex-col justify-between gap-2 shadow-xs"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-rose-950 truncate">{al.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {al.facility?.name} · Stock: <strong>{al.currentStock} {al.unit}</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleRestock(al._id, 150)}
                  disabled={restockingId === al._id}
                  className="py-1 px-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border-none flex items-center justify-center gap-1 self-start"
                >
                  <Plus className="w-3 h-3" />
                  <span>{restockingId === al._id ? "Restocking..." : "Requisition Stock (+150)"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar text-xs">
          {[
            { id: "all", label: `All Drugs (${medicines.length})` },
            { id: "stockout", label: `Stock-Outs (${alerts.length})` },
            { id: "Emergency / Life-Saving", label: "Life-Saving" },
            { id: "Maternal / Iron-Folic", label: "Maternal IFA" },
            { id: "Antihypertensives", label: "BP / Cardiac" },
            { id: "Antidiabetic", label: "Diabetes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                categoryFilter === tab.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search drug name, generic, facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-600 shadow-xs font-sans"
          />
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedicines.map((med) => {
          const isLow = med.isStockOut || med.currentStock <= med.minimumThreshold;

          return (
            <div
              key={med._id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 text-left transition-all ${
                isLow ? "border-rose-200 bg-rose-50/15" : "border-slate-200"
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {med.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase ${
                      med.isStockOut
                        ? "bg-rose-100 text-rose-800 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {med.isStockOut ? "Stock Out" : "In Stock"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{med.name}</h3>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">{med.genericName}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono text-slate-700 mt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Current Stock</span>
                    <strong className={`text-sm ${med.isStockOut ? "text-rose-600" : "text-slate-900"}`}>
                      {med.currentStock} {med.unit}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Facility</span>
                    <span className="text-xs font-bold text-teal-800">{med.facility?.name?.split(" ")[0] || "PHC"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Min Threshold: {med.minimumThreshold}</span>
                <button
                  onClick={() => handleRestock(med._id, 100)}
                  disabled={restockingId === med._id}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer border border-slate-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Restock +100</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
