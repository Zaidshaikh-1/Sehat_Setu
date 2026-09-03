import React from "react";
import { Navbar } from "../components/landing/Navbar.jsx";
import { FooterSection } from "../components/landing/FooterSection.jsx";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 text-left">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700">
            Terms of Public Health Decision Support
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Terms of Service & Clinical Boundary Notice
          </h1>
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">
            1. Clinical Decision Support Scope
          </h2>
          <p>
            Setu provides digital clinical decision support based on national public health guidelines (IMNCI, maternal danger sign protocols, and NCD algorithms). It is designed to assist, not replace, certified medical practitioners.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
            2. 108 Emergency SOS Escalation
          </h2>
          <p>
            The 1-Tap Emergency SOS protocol is intended for life-threatening obstetric, pediatric, and trauma situations to fast-track ambulance dispatch and hospital reception preparation.
          </p>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
