import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Globe, ArrowRight } from "lucide-react";

export function Navbar({ onNavigate }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, language, setLanguage } = useAuth();

  const handleNav = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      navigate(target.startsWith("/") ? target : `/${target}`);
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#D3D4C0] sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center w-full">
        {/* Brand */}
        <div
          className="flex items-center select-none cursor-pointer gap-3"
          onClick={() => handleNav("/")}
        >
          <div className="w-9 h-9 rounded-2xl bg-white text-[#0A2947] flex items-center justify-center font-serif text-lg font-black italic shadow-2xs border border-[#D3D4C0]">
            S
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display text-xl font-bold tracking-tight text-[#1f2229] uppercase leading-none">
              SETU
            </span>
            <span className="text-[9.5px] font-mono tracking-wider text-teal-800 uppercase font-semibold mt-0.5">
              Rural Healthcare Bridge · SIH21633
            </span>
          </div>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-700 font-sans">
          <a href="#product" className="hover:text-teal-900 transition-colors text-slate-700 no-underline">
            Capabilities
          </a>
          <a href="#orbit" className="hover:text-teal-900 transition-colors text-slate-700 no-underline">
            Ecosystem
          </a>
          <a href="#workflow" className="hover:text-teal-900 transition-colors text-slate-700 no-underline">
            Workflow
          </a>
          <button onClick={() => handleNav("/about")} className="hover:text-teal-900 transition-colors cursor-pointer bg-transparent border-none text-slate-700 font-semibold text-xs p-0">
            About System
          </button>
          <button onClick={() => handleNav("/privacy")} className="hover:text-teal-900 transition-colors cursor-pointer bg-transparent border-none text-slate-700 font-semibold text-xs p-0">
            ABDM Privacy
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-white border border-[#D3D4C0] rounded-xl px-2.5 py-1.5 gap-1 text-xs font-mono shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
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
              className="px-4 py-2 bg-[#1f2229] hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-none"
              onClick={() => handleNav("/patients")}
            >
              <span>Workspace ({user?.role?.toUpperCase()})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                className="px-4 py-2 bg-white border border-[#D3D4C0] hover:bg-[#F3E4C9]/40 text-slate-800 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                onClick={() => handleNav("/login")}
              >
                Sign In
              </button>
              <button
                className="px-4 py-2 bg-[#1f2229] hover:bg-teal-900 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border-none shadow-xs"
                onClick={() => handleNav("/login")}
              >
                <span>Select Role</span>
                <span className="text-xs text-teal-400">✦</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
