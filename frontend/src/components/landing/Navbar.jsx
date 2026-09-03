import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useTranslation } from "../../context/AuthContext.jsx";
import { Globe, ArrowRight, Stethoscope } from "lucide-react";

export function Navbar({ onNavigate }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, language, setLanguage } = useAuth();
  const { t } = useTranslation();

  const handleNav = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      navigate(target.startsWith("/") ? target : `/${target}`);
    }
  };

  return (
    <div className="w-full bg-[#fafafc]/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center w-full">
        {/* Brand */}
        <div
          className="flex items-center select-none cursor-pointer gap-2.5"
          onClick={() => handleNav("/")}
        >
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-sans text-sm font-black shadow-xs">
            S
          </div>
          <div className="flex flex-col text-left">
            <span className="font-sans text-lg font-black tracking-tight text-slate-900 uppercase leading-none">
              {t("brandTitle")}
            </span>
            <span className="text-[9px] font-mono tracking-wider text-slate-500 uppercase font-bold mt-0.5">
              {t("brandSubtitle")}
            </span>
          </div>
        </div>

        {/* Center Links */}
        <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600 font-sans">
          <a href="#product" className="hover:text-slate-950 transition-colors text-slate-600 no-underline">
            {t("navCapabilities")}
          </a>
          <a href="#orbit" className="hover:text-slate-950 transition-colors text-slate-600 no-underline">
            {t("navEcosystem")}
          </a>
          <a href="#workflow" className="hover:text-slate-950 transition-colors text-slate-600 no-underline">
            {t("navWorkflow")}
          </a>
          <button
            onClick={() => handleNav("/about")}
            className="hover:text-slate-950 transition-colors cursor-pointer bg-transparent border-none text-slate-600 font-semibold text-xs p-0"
          >
            {t("navAbout")}
          </button>
          <button
            onClick={() => handleNav("/privacy")}
            className="hover:text-slate-950 transition-colors cursor-pointer bg-transparent border-none text-slate-600 font-semibold text-xs p-0"
          >
            {t("navPrivacy")}
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Contact ASHA Link */}
          <button
            onClick={() => handleNav("/contact-asha")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border-none"
          >
            <Stethoscope className="w-3.5 h-3.5 text-slate-900" />
            <span>{t("navContactAsha")}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-white rounded-lg px-2 py-1 gap-1 text-xs font-mono shadow-xs">
            <Globe className="w-3 h-3 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>

          {isAuthenticated ? (
            <button
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-none"
              onClick={() => handleNav("/patients")}
            >
              <span>{t("navWorkspace")} ({user?.role?.toUpperCase()})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer border-none"
                onClick={() => handleNav("/login")}
              >
                {t("navSignIn")}
              </button>
              <button
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer border-none shadow-xs"
                onClick={() => handleNav("/login")}
              >
                <span>{t("navSelectRole")}</span>
                <span className="text-xs text-slate-400">✦</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
