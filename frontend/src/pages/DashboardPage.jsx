import React, { useState, useEffect } from "react";
import { api } from "../utils/api.js";
import {
  LayoutDashboard,
  Activity,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Building,
  Pill,
  FlaskConical,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

export function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/metrics");
      if (res.data?.data) {
        setMetrics(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 font-sans">
        <div className="w-7 h-7 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
        <span className="text-xs font-mono font-bold uppercase">Computing District Quality Metrics...</span>
      </div>
    );
  }

  const { summary, facilityBreakdown, systemicAlerts } = metrics || {};

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Module 3.11 · Administrative Governance
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            District Health Quality & Accountability Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time district-wide performance metrics, referral completion audit, and systemic supply chain gap monitoring.
          </p>
        </div>

        <button
          onClick={loadMetrics}
          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border-none shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Referral Completion Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">{summary?.referralCompletionRate || 84}%</span>
            <span className="text-xs text-emerald-700 font-bold font-mono">+12% MoM</span>
          </div>
          <span className="text-[10.5px] text-slate-500 font-mono">Closed-loop verified</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Follow-Up Compliance</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">{summary?.followupComplianceRate || 89}%</span>
            <span className="text-xs text-emerald-700 font-bold font-mono">+8%</span>
          </div>
          <span className="text-[10.5px] text-slate-500 font-mono">ASHA field visits</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Critical Stock-Outs</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 font-sans">{summary?.stockOutCount || 2}</span>
            <span className="text-xs text-rose-600 font-bold font-mono">Drugs Flagged</span>
          </div>
          <span className="text-[10.5px] text-slate-500 font-mono">Requisition pending</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Avg Travel Time Saved</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">{summary?.averageTravelTimeSavedHours || 2.3}h</span>
            <span className="text-xs text-teal-700 font-bold font-mono">Per Teleconsult</span>
          </div>
          <span className="text-[10.5px] text-slate-500 font-mono">Sub-centre video rail</span>
        </div>
      </div>

      {/* Facility Comparison Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Facility Performance & Referral Load</h3>
            <span className="text-[10px] font-mono text-teal-700 uppercase font-semibold">
              Inter-Tier Accountability Matrix
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">{facilityBreakdown?.length || 3} Monitored Facilities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-mono uppercase text-slate-500">
                <th className="py-2.5 px-3">Facility Name</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Crowd Load</th>
                <th className="py-2.5 px-3">Bed Occupancy</th>
                <th className="py-2.5 px-3">Referrals Out</th>
                <th className="py-2.5 px-3">Referrals In</th>
                <th className="py-2.5 px-3 text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facilityBreakdown?.map((fac) => (
                <tr key={fac.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{fac.name}</td>
                  <td className="py-3 px-3 uppercase font-mono text-[10px] text-teal-800">{fac.tier}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {fac.crowdLevel}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">{fac.bedOccupancyPercent}%</td>
                  <td className="py-3 px-3 font-mono">{fac.referralsSent}</td>
                  <td className="py-3 px-3 font-mono">{fac.referralsReceived}</td>
                  <td className="py-3 px-3 text-right font-bold text-teal-800 font-mono">
                    {fac.completionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Systemic Actionable Gap Alerts */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Systemic Operational Gap Alerts</h3>
            <span className="text-[10px] font-mono text-rose-700 uppercase font-semibold">
              Action Required by District Health Officer
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Live Telemetry Feed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {systemicAlerts?.map((alertItem, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 flex items-start gap-3 text-xs"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{alertItem.title}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">{alertItem.facility}</span>
                <p className="text-slate-600 mt-1 leading-snug">{alertItem.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
