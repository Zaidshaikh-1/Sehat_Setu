import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Users, Stethoscope, Building, ArrowRight } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "admin") navigate("/dashboard");
      else if (user.role === "doctor") navigate("/consultation");
      else navigate("/patients");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials. Use 1-click role cards below.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError("");
    setLoading(true);
    try {
      const user = await quickDemoLogin(role);
      if (user.role === "admin") navigate("/dashboard");
      else if (user.role === "doctor") navigate("/consultation");
      else navigate("/patients");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log in with selected demo account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between font-sans antialiased text-slate-800">
      {/* Top Navbar */}
      <div className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
          <div className="w-9 h-9 rounded-2xl bg-white text-[#0A2947] flex items-center justify-center font-serif text-lg font-black italic shadow-2xs border border-[#D3D4C0]">
            S
          </div>
          <span className="font-display font-bold text-xl text-[#1f2229] tracking-tight">SETU</span>
        </Link>
        <Link to="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors no-underline">
          Back to Overview
        </Link>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto px-6 py-4 flex flex-col items-center gap-8">
        <div className="text-center max-w-xl">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 block mb-1">
            Role-Based Health System Authentication
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#1f2229] tracking-tight">
            Sign In to Your <span className="italic font-normal text-teal-800">Operational Workspace</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-sans">
            Select a verified public health role to test live clinical workflows, or sign in with your official health network credentials.
          </p>
        </div>

        {error && (
          <div className="w-full max-w-2xl p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold text-left">
            {error}
          </div>
        )}

        {/* 3 Prominent 1-Click Role Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* Card 1: ASHA Frontline */}
          <div
            onClick={() => handleDemoLogin("asha")}
            className="bg-white border border-[#D3D4C0] hover:border-teal-700 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all cursor-pointer text-left flex flex-col justify-between gap-4 group"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D3D4C0] text-teal-800 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-teal-800 block">Frontline Field Surface</span>
                <h3 className="text-lg font-serif font-bold text-[#1f2229] group-hover:text-teal-800 transition-colors">
                  ASHA Worker
                </h3>
                <span className="text-xs text-slate-500 font-medium">Meera Jadhav · Rampur Sub-Centre</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Conduct offline field triage, track high-risk ANC pregnancies, log home visit vitals, and claim activity incentives.
              </p>
            </div>

            <div className="pt-3 border-t border-[#D3D4C0]/60 flex items-center justify-between text-xs font-bold text-teal-800">
              <span>Launch ASHA Console</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: PHC Medical Officer */}
          <div
            onClick={() => handleDemoLogin("doctor")}
            className="bg-white border border-[#D3D4C0] hover:border-teal-700 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all cursor-pointer text-left flex flex-col justify-between gap-4 group"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D3D4C0] text-teal-800 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-teal-800 block">Primary Clinical Care</span>
                <h3 className="text-lg font-serif font-bold text-[#1f2229] group-hover:text-teal-800 transition-colors">
                  PHC Doctor
                </h3>
                <span className="text-xs text-slate-500 font-medium">Dr. Prakash Sharma · Khandala PHC</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Perform assisted teleconsultation, generate structured SOAP clinical notes, author e-prescriptions, and order referrals.
              </p>
            </div>

            <div className="pt-3 border-t border-[#D3D4C0]/60 flex items-center justify-between text-xs font-bold text-teal-800">
              <span>Launch Doctor Console</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: District Health Officer */}
          <div
            onClick={() => handleDemoLogin("admin")}
            className="bg-white border border-[#D3D4C0] hover:border-teal-700 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all cursor-pointer text-left flex flex-col justify-between gap-4 group"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D3D4C0] text-teal-800 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-teal-800 block">Administrative Governance</span>
                <h3 className="text-lg font-serif font-bold text-[#1f2229] group-hover:text-teal-800 transition-colors">
                  District Admin
                </h3>
                <span className="text-xs text-slate-500 font-medium">Dr. Sunita Rao · Pune DHO Office</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Audit closed-loop referral completion, monitor pharmacy stock-out alerts, track diagnostic downtime, and review hospital loads.
              </p>
            </div>

            <div className="pt-3 border-t border-[#D3D4C0]/60 flex items-center justify-between text-xs font-bold text-teal-800">
              <span>Launch District Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Manual Credentials Option */}
        <div className="w-full max-w-md bg-white border border-[#D3D4C0] rounded-3xl p-6 shadow-xs flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-900">Manual Account Sign In</h3>
            <span className="text-[11px] text-slate-500">Sign in using an assigned public health email address</span>
          </div>

          <form onSubmit={handleManualLogin} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Staff Email</label>
              <input
                type="email"
                required
                placeholder="meera.asha@setu.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-700 font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                placeholder="setu123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-700 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1f2229] hover:bg-[#0A2947] text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none shadow-xs mt-1"
            >
              {loading ? "Authenticating..." : "Sign In to Console"}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-xs font-mono text-slate-400 uppercase">
        Setu Integrated Rural Health Access Platform · SIH21633
      </div>
    </div>
  );
}
