import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Globe, ChevronDown, Stethoscope, Users, Building, ShieldAlert } from "lucide-react";

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, quickDemoLogin, language, setLanguage } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const path = location.pathname;
  let pageTitle = "Patient Registry";
  if (path.startsWith("/triage")) pageTitle = "Clinical Triage & Decision Engine";
  if (path.startsWith("/consultation")) pageTitle = "Assisted Teleconsultation & Notes";
  if (path.startsWith("/referrals")) pageTitle = "Closed-Loop Referral State Machine";
  if (path.startsWith("/patient/")) pageTitle = "Longitudinal Patient Record";
  if (path.startsWith("/appointments")) pageTitle = "Queue Management & Token Slots";
  if (path.startsWith("/diagnostics")) pageTitle = "Diagnostic Catalog & Equipment Status";
  if (path.startsWith("/medicine")) pageTitle = "Pharmacy Inventory & Availability";
  if (path.startsWith("/followup")) pageTitle = "High-Risk Follow-Up Registry";
  if (path.startsWith("/dashboard")) pageTitle = "District Health Quality Dashboard";
  if (path.startsWith("/emergency")) pageTitle = "Emergency 108 Dispatch";

  const handleRoleSwitch = async (newRole) => {
    setRoleMenuOpen(false);
    await quickDemoLogin(newRole);
    if (newRole === "admin") {
      navigate("/dashboard");
    } else if (newRole === "doctor") {
      navigate("/consultation");
    } else {
      navigate("/patients");
    }
  };

  const getRoleBadge = () => {
    if (role === "admin") {
      return {
        label: "District Health Officer (Admin)",
        bg: "bg-purple-50 text-purple-900 border-purple-200",
        icon: Building,
      };
    }
    if (role === "doctor") {
      return {
        label: "PHC Medical Officer (Doctor)",
        bg: "bg-blue-50 text-blue-900 border-blue-200",
        icon: Stethoscope,
      };
    }
    return {
      label: "Frontline ASHA Worker",
      bg: "bg-teal-50 text-teal-900 border-teal-200",
      icon: Users,
    };
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  return (
    <header className="w-full bg-[#FAF7F2] border-b border-[#D3D4C0] px-6 py-3.5 flex items-center justify-between z-30 shrink-0 font-sans">
      {/* Left Title & Active Workspace Context */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Setu Console</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-teal-800">{user?.facilityName || "Sub-Centre"}</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-[#1f2229] tracking-tight leading-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Active Role Indicator Pill */}
        <div className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${roleBadge.bg}`}>
          <RoleIcon className="w-3.5 h-3.5" />
          <span>{roleBadge.label}: <strong>{user?.name}</strong></span>
        </div>

        {/* Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1f2229] hover:bg-[#0A2947] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors border-none shadow-2xs"
          >
            <span>Switch Role</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 top-10 bg-white border border-[#D3D4C0] shadow-xl rounded-2xl w-64 p-2.5 z-50 flex flex-col gap-1 text-left animate-fadeIn">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 px-2 py-1">
                Select Active Perspective
              </span>
              <button
                onClick={() => handleRoleSwitch("asha")}
                className={`w-full px-3 py-2 text-left text-xs rounded-xl transition-colors cursor-pointer border-none flex flex-col ${
                  role === "asha" ? "bg-teal-50 text-teal-900 font-bold" : "text-slate-700 hover:bg-[#FAF7F2]"
                }`}
              >
                <span>Frontline ASHA Worker</span>
                <span className="text-[10px] text-slate-500 font-normal">Meera Jadhav · Rampur Sub-Centre</span>
              </button>

              <button
                onClick={() => handleRoleSwitch("doctor")}
                className={`w-full px-3 py-2 text-left text-xs rounded-xl transition-colors cursor-pointer border-none flex flex-col ${
                  role === "doctor" ? "bg-blue-50 text-blue-900 font-bold" : "text-slate-700 hover:bg-[#FAF7F2]"
                }`}
              >
                <span>PHC Medical Officer (Doctor)</span>
                <span className="text-[10px] text-slate-500 font-normal">Dr. Prakash Sharma · Khandala PHC</span>
              </button>

              <button
                onClick={() => handleRoleSwitch("admin")}
                className={`w-full px-3 py-2 text-left text-xs rounded-xl transition-colors cursor-pointer border-none flex flex-col ${
                  role === "admin" ? "bg-purple-50 text-purple-900 font-bold" : "text-slate-700 hover:bg-[#FAF7F2]"
                }`}
              >
                <span>District Health Officer (Admin)</span>
                <span className="text-[10px] text-slate-500 font-normal">Dr. Sunita Rao · Pune District HQ</span>
              </button>
            </div>
          )}
        </div>

        {/* Language Selector */}
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

        {/* Emergency SOS Shortcut */}
        <button
          onClick={() => navigate("/emergency")}
          className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border-none shadow-2xs"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>108 SOS</span>
        </button>
      </div>
    </header>
  );
}
