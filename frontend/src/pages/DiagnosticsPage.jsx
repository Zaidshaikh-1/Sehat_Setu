import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../utils/api.js";
import {
  FlaskConical,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Building,
  RefreshCw,
} from "lucide-react";

export function DiagnosticsPage() {
  const { patients, activePatient } = useOutletContext();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderModalTest, setOrderModalTest] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(activePatient?._id || "");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState("");

  const loadDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/diagnostics");
      if (res.data?.data) {
        setDiagnostics(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const handleEquipmentStatusToggle = async (diagnosticId, newStatus) => {
    try {
      await api.patch(`/diagnostics/${diagnosticId}/equipment-status`, { equipmentStatus: newStatus });
      await loadDiagnostics();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!orderModalTest || !selectedPatientId) return;

    setSubmittingOrder(true);
    try {
      await api.post("/diagnostics/order", {
        patientId: selectedPatientId,
        diagnosticId: orderModalTest._id,
        urgency: "routine",
      });
      setOrderSuccessMessage(`Sample order placed for ${orderModalTest.testName}. Synced to ABHA record.`);
      setTimeout(() => {
        setOrderModalTest(null);
        setOrderSuccessMessage("");
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to order test");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-white p-7 rounded-3xl border border-[#D3D4C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 block mb-1">
            Module 3.6 · Laboratory Infrastructure
          </span>
          <h2 className="text-3xl font-serif font-bold text-[#1f2229] tracking-tight">
            Diagnostic Coordination & Equipment Status
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-sans">
            Machine uptime tracking and direct test ordering to prevent broken-equipment referral loops.
          </p>
        </div>

        <button
          onClick={loadDiagnostics}
          className="p-3.5 bg-white hover:bg-[#FAF7F2] text-slate-700 rounded-2xl transition-colors cursor-pointer border border-[#D3D4C0]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Test Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {diagnostics.map((test) => {
          const isWorking = test.equipmentStatus === "working";
          const statusBadge = isWorking
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-rose-50 text-rose-800 border-rose-200";

          return (
            <div
              key={test._id}
              className={`bg-white border rounded-3xl p-6 shadow-2xs flex flex-col justify-between gap-4 text-left transition-all ${
                isWorking ? "border-[#D3D4C0]" : "border-rose-300 bg-rose-50/15"
              }`}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-teal-800 bg-[#FAF7F2] px-2.5 py-0.5 rounded-md border border-[#D3D4C0]">
                    {test.category}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border uppercase ${statusBadge}`}>
                    {test.equipmentStatus}
                  </span>
                </div>

                <h3 className="text-base font-serif font-bold text-slate-900 mt-1">{test.testName}</h3>

                <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium font-sans">
                  <span className="font-mono text-slate-700">{test.facility?.name}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> Turnaround: ~{test.turnaroundHours} hours</span>
                  <span className="text-slate-400 text-[10px]">{test.sampleRequirements}</span>
                </div>
              </div>

              {/* Status Toggle & Order */}
              <div className="flex flex-col gap-2 pt-3 border-t border-[#D3D4C0]/60">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Equipment Uptime:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEquipmentStatusToggle(test._id, "working")}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer border ${
                        test.equipmentStatus === "working"
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-[#FAF7F2] text-slate-700 border-[#D3D4C0]"
                      }`}
                    >
                      Working
                    </button>
                    <button
                      onClick={() => handleEquipmentStatusToggle(test._id, "broken")}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer border ${
                        test.equipmentStatus === "broken"
                          ? "bg-rose-700 text-white border-rose-700"
                          : "bg-[#FAF7F2] text-slate-700 border-[#D3D4C0]"
                      }`}
                    >
                      Broken
                    </button>
                  </div>
                </div>

                <button
                  disabled={!isWorking}
                  onClick={() => setOrderModalTest(test)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                    isWorking
                      ? "bg-[#1f2229] hover:bg-teal-900 text-white shadow-xs"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>{isWorking ? "Order Test for Patient" : "Equipment Unavailable"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Modal */}
      {orderModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D3D4C0] rounded-3xl max-w-md w-full p-7 shadow-2xl flex flex-col gap-4 text-left animate-fadeIn">
            <div className="flex justify-between items-center pb-3 border-b border-[#D3D4C0]">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1f2229]">Order Diagnostic Test</h3>
                <span className="text-[10px] font-mono text-teal-800 uppercase font-semibold">
                  {orderModalTest.testName}
                </span>
              </div>
              <button
                onClick={() => setOrderModalTest(null)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#D3D4C0] text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {orderSuccessMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{orderSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Assign Patient</label>
                  <select
                    required
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
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

                <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#D3D4C0] flex flex-col gap-1 text-[11px] text-slate-600">
                  <div>Facility: <strong>{orderModalTest.facility?.name}</strong></div>
                  <div>Estimated Turnaround: <strong>{orderModalTest.turnaroundHours} hours</strong></div>
                  <div>Sample: <strong>{orderModalTest.sampleRequirements}</strong></div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOrderModalTest(null)}
                    className="px-4 py-2.5 bg-[#FAF7F2] text-slate-700 font-bold rounded-xl cursor-pointer border border-[#D3D4C0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="px-5 py-2.5 bg-[#1f2229] hover:bg-teal-900 text-white font-bold rounded-xl cursor-pointer border-none shadow-xs"
                  >
                    {submittingOrder ? "Placing Order..." : "Confirm & Sync"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
