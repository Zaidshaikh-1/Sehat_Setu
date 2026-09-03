import React from "react";
import { Navbar } from "../components/landing/Navbar.jsx";
import { FooterSection } from "../components/landing/FooterSection.jsx";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 text-left">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700">
            DPDP Act 2023 & ABDM Compliance
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Privacy Policy & Health Data Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Last Updated: September 2026 · Compliant with the Digital Personal Data Protection (DPDP) Act 2023 and Ayushman Bharat Digital Mission (ABDM) Consent Framework.
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">
            1. Consent-Driven Data Processing
          </h2>
          <p>
            Under the Ayushman Bharat Digital Mission (ABDM), patient health records are linked to a unique 14-digit Ayushman Bharat Health Account (ABHA ID). Health records, vitals, prescriptions, and referral histories are stored only with explicit patient or frontline guardian consent.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
            2. Offline Data Storage & Edge Encryption
          </h2>
          <p>
            Field data collected by ASHA and ANM workers in zero-connectivity zones is encrypted on the local device using AES-256 before synchronization with public health servers.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
            3. Role-Based Access Control
          </h2>
          <p>
            Access to patient health records is strictly partitioned by role. Frontline ASHA workers can only access patients within their assigned village clusters; Medical Officers can access clinical consultations and diagnostic histories; District Health Officers access aggregated, de-identified public health indicators.
          </p>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
