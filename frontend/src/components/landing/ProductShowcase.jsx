import React, { useState } from "react";
import { Activity, Stethoscope, Share2, ArrowRight, CheckCircle2 } from "lucide-react";

export function ProductShowcase({ onTryTriage, onTryTimeline, onTryReferrals }) {
  const [activeTab, setActiveTab] = useState(0);

  const slides = [
    {
      id: "triage",
      badge: "Module 3.1",
      title: "Digital Clinical Triage & Risk Stratification",
      headline: "Evidence-based decision trees in the hands of every frontline worker.",
      desc: "Designed for low-bandwidth rural settings. ASHAs check maternal danger signs, infant distress, and cardiovascular symptoms to immediately categorize risk without clinical guesswork.",
      features: [
        "Offline-compatible rule engine with maternal and pediatric danger checks",
        "Calculates 4 risk tiers: Self-Care, Visit PHC, Urgent Referral, Emergency",
        "Multilingual audio text-to-speech feedback in Hindi and Marathi",
      ],
      icon: Activity,
      action: onTryTriage,
      actionLabel: "Launch Clinical Triage",
    },
    {
      id: "record",
      badge: "Module 3.4",
      title: "Longitudinal ABHA Health Timeline",
      headline: "No more lost paper slips across sub-centres and district hospitals.",
      desc: "Every clinical visit, digital triage result, e-prescription, and lab test is indexed by Ayushman Bharat Health Account (ABHA ID) and formatted to HL7 FHIR R4 interoperability standards.",
      features: [
        "Chronological care stream tracking patient journey across all facilities",
        "Real-time vitals trajectory for gestational hypertension and chronic diabetes",
        "Standardized HL7 FHIR JSON payloads ready for national ABDM sync",
      ],
      icon: Stethoscope,
      action: onTryTimeline,
      actionLabel: "View Longitudinal Record",
    },
    {
      id: "referral",
      badge: "Module 3.5",
      title: "Closed-Loop Referral State Machine",
      headline: "Zero leakage between primary care and tertiary specialty hospitals.",
      desc: "Converts verbal referrals into verifiable digital tickets tracked across 4 live states. When a patient arrives at the District Hospital, the receiving doctor already has their full clinical context.",
      features: [
        "4-Column Kanban tracking: Issued -> Traveling -> Arrived -> Seen",
        "Socket.IO real-time synchronization between PHCs and District Hospitals",
        "Auditable milestone logs with automated ASHA follow-up notification",
      ],
      icon: Share2,
      action: onTryReferrals,
      actionLabel: "Open Referral Kanban",
    },
  ];

  const current = slides[activeTab];
  const Icon = current.icon;

  return (
    <section id="product" className="py-16 bg-slate-50 border-b border-slate-200 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-2xl mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Core Platform Capabilities
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Designed for the Reality of Rural Healthcare
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 gap-1 mb-8 max-w-xl w-full">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                activeTab === idx
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {s.badge} · {s.id.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Slide Display Card */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs text-left grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Info (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold uppercase text-teal-700">
                {current.badge} · {current.title}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {current.headline}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {current.desc}
            </p>

            {/* Features list */}
            <div className="flex flex-col gap-2 pt-2">
              {current.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={current.action}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer border-none"
              >
                <span>{current.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Visual Container (5 cols) */}
          <div className="md:col-span-5 bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between min-h-[280px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[10px] font-mono text-teal-400 font-bold uppercase">
                Live Module Telemetry
              </span>
              <span className="text-[10px] font-mono text-slate-400">ABDM FHIR R4</span>
            </div>

            <div className="my-auto py-4 flex flex-col gap-3">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-mono">
                <span className="text-slate-400 text-[10px] block uppercase">System Status</span>
                <strong className="text-teal-300">Active Operational Node</strong>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-mono">
                <span className="text-slate-400 text-[10px] block uppercase">Network Protocol</span>
                <strong className="text-slate-200">2G / 3G Store & Forward Sync</strong>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              Validated on Maharashtra Rural Public Health Dataset
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
