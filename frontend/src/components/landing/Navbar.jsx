import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Activity, Globe, ArrowRight } from "lucide-react";

export function Navbar({ onNavigate }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, quickDemoLogin, language, setLanguage } = useAuth();

  const handleNav = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      navigate(target.startsWith("/") ? target : `/${target}`);
    }
  };

  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center w-full">
        {/* Brand */}
        <div
          className="flex items-center select-none cursor-pointer gap-2.5"
          onClick={() => handleNav("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            SETU
          </div>
          <div className="flex flex-col text-left">
            <span className="font-sans text-xl font-bold tracking-tight text-slate-900 uppercase leading-none">
              SETU
            </span>
            <span className="text-[9px] font-mono tracking-wider text-teal-700 uppercase font-semibold mt-0.5">
              Rural Healthcare Bridge · SIH21633
            </span>
          </div>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <button onClick={() => handleNav("/#product")} className="hover:text-slate-900 transition-colors cursor-pointer bg-transparent border-none">
            Capabilities
          </button>
          <button onClick={() => handleNav("/#orbit")} className="hover:text-slate-900 transition-colors cursor-pointer bg-transparent border-none">
            Care Ecosystem
          </button>
          <button onClick={() => handleNav("/#workflow")} className="hover:text-slate-900 transition-colors cursor-pointer bg-transparent border-none">
            Workflow Rails
          </button>
          <button onClick={() => handleNav("/about")} className="hover:text-slate-900 transition-colors cursor-pointer bg-transparent border-none">
            About System
          </button>
          <button onClick={() => handleNav("/privacy")} className="hover:text-slate-900 transition-colors cursor-pointer bg-transparent border-none">
            ABDM Privacy
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 gap-1 text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
            </select>
          </div>

          {isAuthenticated ? (
            <button
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-none"
              onClick={() => handleNav("/patients")}
            >
              <span>Workspace ({user?.role?.toUpperCase()})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-lg transition-all cursor-pointer"
                onClick={() => handleNav("/login")}
              >
                Sign In
              </button>
              <button
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border-none"
                onClick={() => handleNav("/login")}
              >
                <span>Select Role</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
