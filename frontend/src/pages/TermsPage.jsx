import React, { useEffect } from "react";
import { Navbar } from "../components/landing/Navbar.jsx";
import { FooterSection } from "../components/landing/FooterSection.jsx";

export function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col font-sans select-none overflow-x-clip text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-14 md:py-20 text-left">
        <div className="mb-14 border-b border-slate-200/80 pb-8 text-left">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-700 block mb-3">
            LEGAL & OPERATIONAL TERMS
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#22252a] font-bold tracking-tight leading-none">
            Terms of Service
          </h1>
        </div>

        <div className="text-base sm:text-lg text-slate-700 leading-relaxed mb-12 max-w-3xl">
          Welcome to Setu. By accessing this public healthcare coordination platform, healthcare personnel and administrative officers agree to abide by National Health Mission (NHM) and ABDM operational protocols.
        </div>

        <div className="flex flex-col gap-12 max-w-3xl">
          {/* Section 01 */}
          <section className="flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-widest">01 / CLINICAL DISCLAIMER</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22252a]">
              Clinical Decision Support Boundaries
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Setu's digital triage and symptom stratification tools are rule-based clinical decision-support mechanisms designed to assist non-clinical frontline workers (ASHAs/ANMs) in identifying red flags. <strong>They do not constitute final clinical diagnoses.</strong>
            </p>
            <div className="border-l-2 border-slate-900 pl-4 py-1.5 text-base sm:text-lg text-slate-900 font-bold leading-relaxed">
              Registered Medical Officers retain full clinical responsibility for verifying diagnoses, writing prescriptions, and ordering tertiary hospital referrals.
            </div>
          </section>

          {/* Section 02 */}
          <section className="flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-widest">02 / ROLES & ACCESS</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22252a]">
              Staff Verification & Role Integrity
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Access is strictly restricted to verified healthcare workers empaneled under the district health administration. Staff must maintain credential confidentiality and ensure all entries are accurate.
            </p>
          </section>

          {/* Section 03 */}
          <section className="flex flex-col gap-3 border-t border-slate-200/80 pt-8">
            <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-widest">03 / CONTACT</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22252a]">
              Legal & Compliance Contact
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Email: <span className="text-teal-700 underline">legal@setu.gov.in</span>
            </p>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
