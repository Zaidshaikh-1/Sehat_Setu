import React, { useState } from "react";
import { Activity, Stethoscope, Share2, ArrowRight, CheckCircle2 } from "lucide-react";

export function ProductShowcase({ onTryTriage, onTryTimeline, onTryReferrals }) {
  const [activeTab, setActiveTab] = useState(0);

  const slides = [
    {
      id: "triage",
      badge: "01 TRIAGE",
      tagline: "Frontline Risk Stratification",
      headline: "Evidence-based clinical decision trees in the hands of every frontline worker.",
      desc: "Designed for low-bandwidth rural settings. ASHAs check maternal danger signs, infant distress, and cardiovascular symptoms to immediately calculate risk tiers without guesswork.",
      features: [
        "Offline-compatible rule engine with maternal and pediatric danger checks",
        "Calculates 4 risk tiers: Self-Care, Visit PHC, Urgent Referral, Emergency",
        "Multilingual text-to-speech audio feedback in Hindi and Marathi",
      ],
      icon: Activity,
      action: onTryTriage,
      actionLabel: "Launch Clinical Triage",
      previewText: "BP: 148/94 mmHg · Severe Pedal Edema · Flag: High-Risk Gestational Hypertension",
    },
    {
      id: "record",
      badge: "02 RECORD",
      tagline: "Longitudinal Care Memory",
      headline: "No more lost paper slips across sub-centres and district hospitals.",
      desc: "Every clinical visit, digital triage check, e-prescription, and lab test is indexed by Ayushman Bharat Health Account (ABHA ID) and formatted to HL7 FHIR R4 interoperability standards.",
      features: [
        "Chronological care stream tracking patient journey across all facilities",
        "Real-time vitals trajectory for gestational hypertension and chronic diabetes",
        "Standardized HL7 FHIR JSON payloads ready for national ABDM sync",
      ],
      icon: Stethoscope,
      action: onTryTimeline,
      actionLabel: "View Longitudinal Record",
      previewText: "ABHA: 91-8274-1928-4401 · Sunita Devi · Gestational Age: 28w",
    },
    {
      id: "referral",
      badge: "03 TRACK",
      tagline: "Closed-Loop Referral Rail",
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
      previewText: "Referral Code: REF-2026-0819 · Status: Traveling -> Pune District Hospital",
    },
  ];

  const current = slides[activeTab];
  const Icon = current.icon;

  return (
    <section id="product" className="py-20 bg-[#FAF7F2] border-b border-[#D3D4C0] text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-2xl mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 block mb-1">
            Care Architecture
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#1f2229] tracking-tight">
            How Setu Powers the <span className="italic font-normal text-teal-800">Public Health Rail</span>
          </h2>
        </div>

        {/* Tab Pills */}
        <div className="flex bg-white p-1 rounded-2xl border border-[#D3D4C0] gap-1 mb-10 max-w-lg w-full shadow-2xs">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                activeTab === idx
                  ? "bg-[#1f2229] text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {s.badge}
            </button>
          ))}
        </div>

        {/* Slide Showcase Card */}
        <div className="w-full bg-white border border-[#D3D4C0] rounded-3xl p-8 sm:p-10 shadow-xs text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Description (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#D3D4C0] text-teal-800 flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase text-teal-800">
                {current.tagline}
              </span>
            </div>

            <h3 className="text-3xl font-serif font-bold text-[#1f2229] tracking-tight leading-snug">
              {current.headline}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              {current.desc}
            </p>

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
                className="px-6 py-3 bg-[#1f2229] hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer border-none"
              >
                <span>{current.actionLabel}</span>
                <span className="text-xs text-teal-400">✦</span>
              </button>
            </div>
          </div>

          {/* Right Simulated Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-2xl p-6 flex flex-col justify-between min-h-[300px] shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D3D4C0]">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-800">
                HL7 FHIR R4 Schema
              </span>
              <span className="text-[10px] font-mono text-slate-400">ABDM Sync: Ready</span>
            </div>

            <div className="my-auto py-4 flex flex-col gap-3">
              <div className="p-4 bg-white rounded-xl border border-[#D3D4C0] text-xs font-mono">
                <span className="text-slate-400 text-[9.5px] block uppercase">Live Telemetry Snapshot</span>
                <strong className="text-slate-900 block mt-1">{current.previewText}</strong>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-[#D3D4C0] flex items-center justify-between">
              <span>Security: AES-256</span>
              <span>Network: 2G/3G Compatible</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
