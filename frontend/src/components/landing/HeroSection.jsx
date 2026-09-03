import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ArrowRight, ShieldCheck, Users, Stethoscope, Building } from "lucide-react";

export function HeroSection({ onExploreAsha, onOpenTriage, onOpenConsole }) {
  const navigate = useNavigate();
  const { quickDemoLogin } = useAuth();

  const handleLaunchRole = async (role) => {
    await quickDemoLogin(role);
    if (role === "admin") navigate("/dashboard");
    else if (role === "doctor") navigate("/consultation");
    else navigate("/patients");
  };

  return (
    <header className="relative w-full flex flex-col items-center justify-center text-center px-6 gap-8 z-10 max-w-5xl mx-auto pt-16 pb-20">
      {/* Top Tag */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D3D4C0] text-[#0A2947] text-xs font-mono font-medium shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
        <span>SIH 2026 Problem Statement · PS Ref: SIH21633</span>
      </div>

      {/* Signature Clinicians / Scribologist Serif Headline */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-[#1f2229] leading-[1.05] tracking-tight text-center max-w-4xl">
        One patient. One ABHA record. <br className="hidden sm:inline" />
        <span className="italic font-normal text-teal-800">Every rural facility connected.</span>
      </h1>

      <p className="text-sm sm:text-base text-[#1f2229]/70 max-w-2xl leading-relaxed font-sans -mt-2">
        Setu is the integrated care bridge connecting frontline ASHA field workers, Primary Health Centres (PHCs), and District Hospitals with offline triage, assisted teleconsultation, and closed-loop referral tracking.
      </p>

      {/* Main Action Button (Clinicians Style) */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-3.5 bg-[#1f2229] hover:bg-[#0A2947] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border-none"
        >
          <span>Launch Operational Console</span>
          <span className="text-xs text-teal-400">✦</span>
        </button>

        <a
          href="#orbit"
          className="px-6 py-3.5 bg-white hover:bg-[#F3E4C9]/60 text-[#1f2229] font-semibold text-sm rounded-xl border border-[#D3D4C0] transition-all no-underline shadow-2xs"
        >
          Explore Care Ecosystem
        </a>
      </div>

      {/* 3 Quick Role Switch Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-4xl text-left">
        <div
          onClick={() => handleLaunchRole("asha")}
          className="bg-white border border-[#D3D4C0] hover:border-teal-700 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#D3D4C0] text-teal-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-teal-700 block">Role: Frontline ASHA</span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Meera Jadhav</h4>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Run offline field triage, track high-risk ANC pregnancies, and log home visits.
          </p>
          <div className="pt-2 border-t border-[#D3D4C0]/50 flex items-center justify-between text-[11px] font-bold text-teal-800">
            <span>Launch ASHA Workspace</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => handleLaunchRole("doctor")}
          className="bg-white border border-[#D3D4C0] hover:border-teal-700 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#D3D4C0] text-teal-800 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-teal-700 block">Role: PHC Doctor</span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Dr. Prakash Sharma</h4>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Conduct assisted teleconsultations, author e-prescriptions, and issue specialist referrals.
          </p>
          <div className="pt-2 border-t border-[#D3D4C0]/50 flex items-center justify-between text-[11px] font-bold text-teal-800">
            <span>Launch Doctor Console</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => handleLaunchRole("admin")}
          className="bg-white border border-[#D3D4C0] hover:border-teal-700 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#D3D4C0] text-teal-800 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-teal-700 block">Role: District Admin</span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Dr. Sunita Rao</h4>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Track referral drop-offs, monitor pharmacy stock-outs, and review hospital capacity.
          </p>
          <div className="pt-2 border-t border-[#D3D4C0]/50 flex items-center justify-between text-[11px] font-bold text-teal-800">
            <span>Launch Governance Board</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </header>
  );
}
