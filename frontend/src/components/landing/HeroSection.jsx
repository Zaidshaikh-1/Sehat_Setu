import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useTranslation } from "../../context/AuthContext.jsx";
import { ArrowRight, Users, Stethoscope, Building2, Sparkles } from "lucide-react";

export function HeroSection({ onNavigate }) {
  const navigate = useNavigate();
  const { quickDemoLogin } = useAuth();
  const { t } = useTranslation();

  const handleLaunchRole = async (role) => {
    await quickDemoLogin(role);
    if (role === "admin") navigate("/dashboard");
    else if (role === "doctor") navigate("/consultation");
    else navigate("/patients");
  };

  return (
    <header className="relative w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 gap-6 sm:gap-8 z-10 max-w-5xl mx-auto pt-12 sm:pt-20 pb-16">
      {/* Top Tag Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-xs text-slate-800 text-xs font-mono font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{t("heroBadge")}</span>
      </div>

      {/* Signature Bold Sans Headline */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black text-slate-900 leading-[1.08] tracking-tight text-center max-w-4xl">
        {t("heroHeadline")}
      </h1>

      <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-sans -mt-1">
        {t("heroSubhead")}
      </p>

      {/* Main Action Buttons (Clinicians Style) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          onClick={() => navigate("/contact-asha")}
          className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
        >
          <Stethoscope className="w-4 h-4 text-teal-400" />
          <span>{t("heroCtaContact")}</span>
          <span className="text-xs text-slate-400">✦</span>
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
        >
          <span>{t("heroCtaConsole")}</span>
        </button>
      </div>

      {/* 3 Quick Role Switch Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl text-left">
        {/* Frontline ASHA */}
        <div
          onClick={() => handleLaunchRole("asha")}
          className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                {t("roleAshaTitle")}
              </span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                {t("roleAshaName")}
              </h4>
            </div>
          </div>
          <p className="text-[11.5px] text-slate-600 leading-snug">
            {t("roleAshaDesc")}
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-slate-900">
            <span>{t("roleAshaCta")}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* PHC Doctor */}
        <div
          onClick={() => handleLaunchRole("doctor")}
          className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Stethoscope className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                {t("roleDocTitle")}
              </span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                {t("roleDocName")}
              </h4>
            </div>
          </div>
          <p className="text-[11.5px] text-slate-600 leading-snug">
            {t("roleDocDesc")}
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-slate-900">
            <span>{t("roleDocCta")}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* District Admin */}
        <div
          onClick={() => handleLaunchRole("admin")}
          className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                {t("roleAdminTitle")}
              </span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                {t("roleAdminName")}
              </h4>
            </div>
          </div>
          <p className="text-[11.5px] text-slate-600 leading-snug">
            {t("roleAdminDesc")}
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-slate-900">
            <span>{t("roleAdminCta")}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </header>
  );
}
