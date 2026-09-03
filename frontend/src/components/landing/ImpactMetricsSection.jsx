import React from "react";
import { TrendingDown, Clock, ShieldCheck, Activity } from "lucide-react";

export function ImpactMetricsSection() {
  const metrics = [
    {
      value: "68%",
      label: "Reduction in Referral Leakage",
      sub: "Patients tracked from Sub-Centre through District Hospital",
      icon: TrendingDown,
    },
    {
      value: "2.3h",
      label: "Average Travel Time Saved",
      sub: "Per teleconsultation avoiding unnecessary bus journeys",
      icon: Clock,
    },
    {
      value: "< 4 min",
      label: "Decision-Tree Triage Time",
      sub: "Frontline risk stratification with instant danger sign detection",
      icon: Activity,
    },
    {
      value: "100%",
      label: "ABDM FHIR Compatibility",
      sub: "Interoperable health data tied to national Ayushman Bharat Account",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
        <div className="text-center max-w-2xl mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Systemic Healthcare Impact
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Measurable Outcomes for Rural Communities
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <span className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight block">
                    {m.value}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 mt-1">{m.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{m.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
