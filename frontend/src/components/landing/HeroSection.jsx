import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ArrowRight, ShieldCheck, Activity, Users, Stethoscope, Building } from "lucide-react";

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
    <section className="relative overflow-hidden pt-12 pb-16 bg-slate-50 border-b border-slate-200 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold font-mono mb-6">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Smart India Hackathon 2026 · Problem Statement SIH21633</span>
        </div>

        {/* Pure Sans-serif Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl">
          One Patient. One ABHA Record. <br />
          <span className="text-teal-700 font-extrabold">Every Rural Facility Connected.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Setu bridges frontline ASHA field workers, Primary Health Centres (PHCs), and District Hospitals with offline triage, assisted teleconsultations, and closed-loop referral tracking.
        </p>

        {/* 3 Quick Role Action Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">
          <button
            onClick={() => handleLaunchRole("asha")}
            className="p-4 bg-white border border-slate-200 hover:border-teal-600 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer text-left flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 group-hover:text-teal-800">ASHA Field Surface</span>
                <span className="text-[10px] text-slate-500 font-mono">Frontline Worker</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 flex items-center gap-1">
              Launch Workspace <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => handleLaunchRole("doctor")}
            className="p-4 bg-white border border-slate-200 hover:border-blue-600 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer text-left flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-800">PHC Medical Officer</span>
                <span className="text-[10px] text-slate-500 font-mono">Doctor Teleconsult</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
              Launch Workspace <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => handleLaunchRole("admin")}
            className="p-4 bg-white border border-slate-200 hover:border-purple-600 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer text-left flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 group-hover:text-purple-800">District Health Admin</span>
                <span className="text-[10px] text-slate-500 font-mono">DHO Governance</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
              Launch Dashboard <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        {/* Secondary CTAs */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer border-none"
          >
            Sign In with Email & Password
          </button>
          <a
            href="#product"
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all text-decoration-none"
          >
            Explore System Architecture
          </a>
        </div>
      </div>
    </section>
  );
}
