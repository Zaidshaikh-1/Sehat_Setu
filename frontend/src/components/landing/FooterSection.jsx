import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/AuthContext.jsx";

export function FooterSection({ onNavigate }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNav = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      navigate(target.startsWith("/") ? target : `/${target}`);
    }
  };

  return (
    <footer className="bg-[#fafafc] border-t border-slate-200 pt-16 pb-0 flex flex-col gap-8 w-full text-slate-800 relative z-10 overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-start gap-8 md:gap-4 px-6 mb-4">
        {/* Left brand tagline */}
        <div className="text-left md:max-w-xs">
          <h3 className="text-2xl md:text-[28px] font-sans font-black tracking-tight text-slate-900 leading-tight">
            {t("footerTagline")}
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {t("footerDesc")}
          </p>
        </div>

        {/* Right link columns */}
        <div className="flex gap-14 md:gap-20 text-left">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
              {t("footerCoreModules")}
            </span>
            <a href="#product" className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors no-underline">
              {t("footerTriage")}
            </a>
            <a href="#workflow" className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors no-underline">
              {t("footerReferralRail")}
            </a>
            <button onClick={() => handleNav("/patients")} className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              {t("footerAbhaRecord")}
            </button>
            <button onClick={() => handleNav("/dashboard")} className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              {t("footerDashboard")}
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
              {t("footerCompliance")}
            </span>
            <button onClick={() => handleNav("/about")} className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              {t("footerArch")}
            </button>
            <button onClick={() => handleNav("/privacy")} className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              {t("footerPrivacy")}
            </button>
            <button onClick={() => handleNav("/terms")} className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              {t("footerTerms")}
            </button>
            <button onClick={() => handleNav("/emergency")} className="text-xs font-bold text-rose-700 hover:text-rose-950 transition-colors no-underline text-left bg-transparent border-none cursor-pointer p-0">
              {t("footerEmergency")}
            </button>
          </div>
        </div>
      </div>

      {/* Giant Footer Brand Text (Scribologist/Clinicians Style) */}
      <div className="w-full text-center relative select-none pointer-events-none mt-auto z-10">
        <h1 className="text-[14vw] font-sans font-black tracking-tighter text-slate-900/80 leading-none select-none">
          SETU
        </h1>
      </div>

      {/* Copyright & Meta */}
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center pb-6 text-center gap-3 px-6 z-20">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider font-mono select-none">
          <span>{t("footerCopyright")}</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mx-auto uppercase tracking-wide">
          {t("footerDisclaimer")}
        </p>
      </div>

      {/* Signature Halftone Dither Mountain SVG (Clinicians Theme) */}
      <div className="w-full mt-2 select-none pointer-events-none text-slate-700">
        <svg className="w-full h-auto max-h-[300px]" viewBox="0 0 1600 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="setu-dot-light" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.6" fill="#1e293b" opacity="0.2" />
            </pattern>
            <pattern id="setu-dot-medium" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.1" fill="#1e293b" opacity="0.4" />
            </pattern>
            <pattern id="setu-dot-dark" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="#1e293b" opacity="0.75" />
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
            stroke="#1e293b"
            strokeWidth="1"
            fill="none"
            opacity="0.12"
            style={{ animationDuration: "14s" }}
          />
          <path
            className="wind-line"
            d="M -50 80 Q 400 100 850 65 T 1750 85"
            stroke="#1e293b"
            strokeWidth="1.2"
            fill="none"
            opacity="0.1"
            style={{ animationDuration: "18s" }}
          />
        </svg>
      </div>
    </footer>
  );
}
