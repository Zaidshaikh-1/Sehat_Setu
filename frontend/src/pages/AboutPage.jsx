import React, { useEffect } from "react";
import { Navbar } from "../components/landing/Navbar.jsx";
import { FooterSection } from "../components/landing/FooterSection.jsx";

export function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col font-sans select-none overflow-x-clip text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-14 md:py-20 text-left">
        <div className="mb-14 border-b border-slate-200/80 pb-8 text-left">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-700 block mb-3">
            ABOUT SETU · SIH 2026
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#22252a] font-bold tracking-tight leading-none">
            Integrated Rural Care-Access & Quality Platform
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-4 font-mono">
            Smart India Hackathon Problem Statement Ref: SIH21633
          </p>
        </div>

        <div className="text-base sm:text-lg text-slate-700 leading-relaxed mb-12 max-w-3xl">
          Rural patients in India frequently bounce between sub-centres, PHCs, CHCs, and district hospitals with zero shared memory of what transpired at the previous touchpoint. Referrals leak, diagnostic machines sit broken without oversight, and frontline workers are overburdened with paper registers.
        </div>

        <div className="flex flex-col gap-12 max-w-3xl">
          {/* Section 01 */}
          <section className="flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-widest">01 / OUR PHILOSOPHY</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22252a]">
              Strengthen the Public Health System, Don't Replace It
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Setu does not invent a parallel private app that competes with government infrastructure. Instead, it plugs directly into existing <strong>ABHA / ABDM rails</strong>, existing frontline staff roles (ASHA, ANM, Medical Officer), and the existing tier hierarchy to close systemic leaks.
            </p>
          </section>

          {/* Section 02 */}
          <section className="flex flex-col gap-4">
            <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-widest">02 / CORE ARCHITECTURAL PILLARS</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22252a]">
              The 4 Unbroken Links
            </h2>
            <div className="flex flex-col gap-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              <div className="border-l-2 border-teal-700 pl-4 py-1">
                <strong className="text-[#22252a] block">Longitudinal Health Record:</strong>
                One lifetime record follows the patient everywhere, regardless of facility or district.
              </div>
              <div className="border-l-2 border-teal-700 pl-4 py-1">
                <strong className="text-[#22252a] block">Closed-Loop Referral Tracking:</strong>
                Every referral is a trackable state machine (Issued ➔ Traveling ➔ Arrived ➔ Seen) that alerts referring ASHAs when care is completed.
              </div>
              <div className="border-l-2 border-teal-700 pl-4 py-1">
                <strong className="text-[#22252a] block">Offline-First Digital Triage:</strong>
                Rule-based decision tree that operates smoothly on low-end ₹5,000 Android phones without internet.
              </div>
              <div className="border-l-2 border-teal-700 pl-4 py-1">
                <strong className="text-[#22252a] block">District Accountability Layer:</strong>
                Surfaces referral drop-offs, broken diagnostic machines, and pharmacy stock-outs directly to District Health Officers.
              </div>
            </div>
          </section>

          {/* Section 03 */}
          <section className="flex flex-col gap-3 border-t border-slate-200/80 pt-8">
            <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-widest">03 / COLLABORATION</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22252a]">
              Connect With the Development Team
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Built for Smart India Hackathon 2026. For technical queries, ABDM sandbox integrations, or deployment evaluations:
            </p>
            <p className="text-lg sm:text-xl font-bold text-[#22252a]">
              Email: <span className="text-teal-700 underline">contact@setu.gov.in</span>
            </p>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
