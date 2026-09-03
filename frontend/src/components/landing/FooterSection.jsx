import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ShieldCheck, ArrowRight } from "lucide-react";

export function FooterSection({ onNavigate }) {
  const navigate = useNavigate();

  const handleNav = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      navigate(target.startsWith("/") ? target : `/${target}`);
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-12 w-full text-slate-300 font-sans relative z-10">
      <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-start gap-10 px-6">
        {/* Left Column */}
        <div className="text-left md:max-w-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
              SETU
            </div>
            <span className="font-bold text-lg text-white tracking-tight">SETU HEALTHCARE</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Integrated rural care-access, triage, teleconsultation, and closed-loop referral state machine built on Ayushman Bharat Digital Mission (ABDM) standards.
          </p>
          <span className="text-[11px] font-mono text-teal-400 font-semibold">
            SIH Problem Statement Reference: SIH21633
          </span>
        </div>

        {/* Links Columns */}
        <div className="flex gap-14 md:gap-20 text-left text-xs">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Core Modules
            </span>
            <button onClick={() => handleNav("/#product")} className="text-slate-300 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer p-0">
              Digital Triage Engine
            </button>
            <button onClick={() => handleNav("/#workflow")} className="text-slate-300 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer p-0">
              Closed-Loop Referral Rail
            </button>
            <button onClick={() => handleNav("/patients")} className="text-slate-300 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer p-0">
              Longitudinal ABHA Record
            </button>
            <button onClick={() => handleNav("/dashboard")} className="text-slate-300 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer p-0">
              District Health Dashboard
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Compliance & Legal
            </span>
            <button onClick={() => handleNav("/about")} className="text-slate-300 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer p-0">
              About Project & Architecture
            </button>
            <button onClick={() => handleNav("/privacy")} className="text-slate-300 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer p-0">
              DPDP Act & ABDM Privacy
            </button>
            <button onClick={() => handleNav("/terms")} className="text-slate-300 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer p-0">
              Terms of Clinical Support
            </button>
            <button onClick={() => handleNav("/emergency")} className="text-rose-400 hover:text-rose-300 transition-colors text-left bg-transparent border-none cursor-pointer p-0 font-bold">
              108 Emergency SOS Protocol
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6 my-10">
        <div className="h-px bg-slate-800 w-full" />
      </div>

      {/* Meta Footer */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <span>© 2026 Setu Rural Healthcare Platform · Smart India Hackathon</span>
        <span>Standardized on HL7 FHIR R4 & Ayushman Bharat Health Rails</span>
      </div>
    </footer>
  );
}
