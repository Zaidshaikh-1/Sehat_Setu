import React from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/landing/Navbar.jsx";
import { FooterSection } from "../components/landing/FooterSection.jsx";
import { ShieldCheck, HeartPulse, Building, Users, Activity, CheckCircle2 } from "lucide-react";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 text-left">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700">
            System Architecture & Vision
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            About Setu (सेतु) Healthcare
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Smart India Hackathon 2026 Reference Solution · Problem Statement SIH21633
          </p>
        </div>

        {/* Section 1: Problem Statement */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-900">
            The Public Health Reality
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Rural Indian patients frequently navigate between sub-centres, Primary Health Centres (PHCs), Community Health Centres (CHCs), and District Hospitals with no shared memory of what happened at their last visit. Diagnostic availability is fragmented, and verbal referrals often leak when patients fail to reach tertiary hospitals without active tracking.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
            Setu does not attempt to replace the public health system. It strengthens existing health workers (ASHA, ANM, Medical Officers) through interoperable digital rails built directly on Ayushman Bharat Digital Mission (ABDM) standards.
          </div>
        </section>

        {/* Section 2: Key Pillars */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <h2 className="text-xl font-bold text-slate-900">
            Core Architectural Pillars
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">Offline-Ready Triage</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic decision trees evaluate maternal, pediatric, and cardiac danger signs directly on frontline devices without requiring continuous cloud connectivity.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">Longitudinal Care Memory</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every encounter, digital triage check, e-prescription, and lab result is stored against the patient's ABHA ID in standardized HL7 FHIR R4 JSON format.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-700" />
                <h3 className="text-sm font-bold text-slate-900">Closed-Loop Referrals</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verbal referrals are replaced with state machine tickets tracked across Issued, Traveling, Arrived, and Seen states to eliminate referral leakage.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">District Accountability</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time dashboard for District Health Officers showing referral completion percentages, broken diagnostic machinery, and pharmacy stock-out alerts.
              </p>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
