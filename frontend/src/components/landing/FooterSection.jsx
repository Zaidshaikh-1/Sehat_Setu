import React from "react";
import { useNavigate } from "react-router-dom";

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
    <footer className="bg-[#FAF7F2] border-t border-[#D3D4C0] pt-16 pb-0 flex flex-col gap-8 w-full text-slate-800 relative z-10 overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-start gap-8 md:gap-4 px-6 mb-4">
        {/* Left brand tagline */}
        <div className="text-left md:max-w-xs">
          <h3 className="text-2xl md:text-[28px] font-serif font-bold tracking-tight text-[#1f2229] leading-tight">
            Integrated Rural Care<br />
            <span className="italic font-normal text-teal-800">& Quality Platform</span>
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Strengthening India's public health system through interoperable digital rails built on ABHA and ABDM standards.
          </p>
        </div>

        {/* Right link columns */}
        <div className="flex gap-14 md:gap-20 text-left">
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Core Modules
            </span>
            <a href="#product" className="text-xs font-semibold text-slate-700 hover:text-teal-900 transition-colors no-underline">
              Digital Triage Engine
            </a>
            <a href="#workflow" className="text-xs font-semibold text-slate-700 hover:text-teal-900 transition-colors no-underline">
              Closed-Loop Referral Rail
            </a>
            <button onClick={() => handleNav("/patients")} className="text-xs font-semibold text-slate-700 hover:text-teal-900 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              Longitudinal ABHA Record
            </button>
            <button onClick={() => handleNav("/dashboard")} className="text-xs font-semibold text-slate-700 hover:text-teal-900 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              District Dashboard
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Compliance & Legal
            </span>
            <button onClick={() => handleNav("/about")} className="text-xs font-semibold text-slate-700 hover:text-teal-900 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              Architecture Overview
            </button>
            <button onClick={() => handleNav("/privacy")} className="text-xs font-semibold text-slate-700 hover:text-teal-900 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              DPDP Act & ABDM Privacy
            </button>
            <button onClick={() => handleNav("/terms")} className="text-xs font-semibold text-slate-700 hover:text-teal-900 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              Terms of Decision Support
            </button>
            <button onClick={() => handleNav("/emergency")} className="text-xs font-bold text-rose-700 hover:text-rose-900 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              108 Emergency Protocol
            </button>
          </div>
        </div>
      </div>

      {/* Giant Footer Brand Text (Scribologist/Clinicians Style) */}
      <div className="w-full text-center relative select-none pointer-events-none mt-auto z-10">
        <h1 className="text-[14vw] font-display font-black tracking-tighter text-[#1f2229]/80 leading-none select-none">
          SETU
        </h1>
      </div>

      {/* Copyright & Meta */}
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center pb-6 text-center gap-3 px-6 z-20">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono select-none">
          <span>© 2026 SETU RURAL CARE</span>
          <span className="text-slate-300">•</span>
          <span>SMART INDIA HACKATHON 2026 (SIH21633)</span>
          <span className="text-slate-300">•</span>
          <span>HL7 FHIR R4 COMPLIANT</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed max-w-2xl mx-auto uppercase tracking-wide">
          Disclaimer: Setu is a clinical decision-support and care-coordination bridge. Registered medical officers retain clinical responsibility for diagnoses, prescriptions, and patient admissions.
        </p>
      </div>

      {/* Signature Halftone Dither Mountain SVG (Clinicians Theme) */}
      <div className="w-full mt-2 select-none pointer-events-none text-teal-700">
        <svg className="w-full h-auto max-h-[300px]" viewBox="0 0 1600 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="setu-dot-light" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.6" fill="#0F766E" opacity="0.25" />
            </pattern>
            <pattern id="setu-dot-medium" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.1" fill="#0F766E" opacity="0.5" />
            </pattern>
            <pattern id="setu-dot-dark" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="#0F766E" opacity="0.85" />
            </pattern>
          </defs>

          {/* Contour Waves */}
          <path d="M -50 40 Q 400 120 800 60 T 1650 80 L 1650 240 L -50 240 Z" fill="url(#setu-dot-light)" opacity="0.25" />
          <path d="M -50 70 Q 400 140 800 90 T 1650 110 L 1650 240 L -50 240 Z" fill="url(#setu-dot-medium)" opacity="0.4" />
          <path d="M -50 120 Q 400 170 800 140 T 1650 160 L 1650 240 L -50 240 Z" fill="url(#setu-dot-dark)" opacity="0.6" />

          {/* Animated Wind Lines */}
          <path
            className="wind-line"
            d="M -100 45 Q 350 15 800 55 T 1700 25"
            stroke="#0F766E"
            strokeWidth="1"
            fill="none"
            opacity="0.15"
            style={{ animationDuration: "14s" }}
          />
          <path
            className="wind-line"
            d="M -50 80 Q 400 100 850 65 T 1750 85"
            stroke="#0F766E"
            strokeWidth="1.2"
            fill="none"
            opacity="0.12"
            style={{ animationDuration: "18s" }}
          />
        </svg>
      </div>
    </footer>
  );
}
