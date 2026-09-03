import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function BookDemoBanner({ onBookDemo }) {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-slate-900 text-white font-sans text-center">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center gap-6">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Smart India Hackathon 2026 Reference Implementation
        </span>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl">
          Experience Setu Across All 3 Roles in Real-Time
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
          Switch between ASHA field worker, PHC Doctor, and District Health Officer perspectives with a single click to test closed-loop continuity.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              if (onBookDemo) onBookDemo();
              else navigate("/login");
            }}
            className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border-none"
          >
            <span>Launch Live Role Switcher</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate("/about")}
            className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer border-none"
          >
            Read Architecture Whitepaper
          </button>
        </div>
      </div>
    </section>
  );
}
