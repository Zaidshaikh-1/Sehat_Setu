import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Users,
  Activity,
  Stethoscope,
  Share2,
  Calendar,
  FlaskConical,
  Pill,
  ClipboardList,
  LayoutDashboard,
  ShieldAlert,
  Plus,
  Search,
  LogOut,
  Building,
} from "lucide-react";

export function Sidebar({ patients = [], activePatientId, onSelectPatient, onNewTriage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const filteredPatients = (patients || []).filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (p.name || "").toLowerCase();
    const abha = (p.abhaId || "").toLowerCase();
    const village = (p.village || "").toLowerCase();
    return name.includes(q) || abha.includes(q) || village.includes(q);
  });

  const getInitials = (p) => {
    if (!p.name) return "PT";
    const parts = p.name.split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  };

  // Dedicated navigation trees per role
  const getNavItemsByRole = () => {
    if (role === "admin") {
      return [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/referrals", label: "Referrals", icon: Share2 },
        { path: "/patients", label: "Patients", icon: Users },
        { path: "/medicine", label: "Pharmacy", icon: Pill },
        { path: "/diagnostics", label: "Diagnostics", icon: FlaskConical },
        { path: "/appointments", label: "OPD Load", icon: Calendar },
      ];
    }
    if (role === "doctor") {
      return [
        { path: "/consultation", label: "Teleconsult", icon: Stethoscope },
        { path: "/patients", label: "Patients", icon: Users },
        { path: "/referrals", label: "Referrals", icon: Share2 },
        { path: "/diagnostics", label: "Lab Orders", icon: FlaskConical },
        { path: "/appointments", label: "Tokens", icon: Calendar },
        { path: "/medicine", label: "Pharmacy", icon: Pill },
        { path: "/triage", label: "Triage", icon: Activity },
      ];
    }
    // Default ASHA Frontline Worker tree
    return [
      { path: "/patients", label: "Patients", icon: Users },
      { path: "/triage", label: "Triage", icon: Activity },
      { path: "/followup", label: "Worklist", icon: ClipboardList },
      { path: "/consultation", label: "Teleconsult", icon: Stethoscope },
      { path: "/referrals", label: "Referrals", icon: Share2 },
      { path: "/medicine", label: "Drugs", icon: Pill },
      { path: "/emergency", label: "108 SOS", icon: ShieldAlert, emergency: true },
    ];
  };

  const allowedNavItems = getNavItemsByRole();

  const handleNavClick = (path) => {
    if (path === "/patients") {
      setDrawerOpen(!drawerOpen);
    }
    navigate(path);
  };

  return (
    <div className="flex h-full shrink-0 select-none relative z-40">
      {/* 1. Far Left Narrow Icon Rail (64px) - Clinicians / Heidi Style Warm Theme */}
      <aside className="w-[64px] bg-[#F9F6F1] flex flex-col items-center py-5 justify-between h-full shrink-0 border-r border-[#D3D4C0]">
        {/* Top Section */}
        <div className="flex flex-col gap-4 items-center w-full">
          {/* Logo Brand Icon */}
          <div
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-2xl bg-white text-[#0A2947] flex items-center justify-center font-serif text-lg font-black italic shadow-2xs border border-[#D3D4C0] cursor-pointer hover:bg-[#F3E4C9]/60 transition-colors"
            title="Setu Home"
          >
            S
          </div>

          {/* Plus Create Action (Clinicians Style Terracotta/Teal) */}
          <button
            onClick={() => {
              if (onNewTriage) onNewTriage();
              else navigate("/triage");
            }}
            className="w-10 h-10 rounded-xl bg-teal-800 hover:bg-teal-900 text-white flex items-center justify-center cursor-pointer border-none shadow-xs transition-all hover:scale-105"
            title="New Action"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>

          {/* Navigation Items */}
          <div className="flex flex-col gap-2.5 w-full items-center">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center cursor-pointer border-none transition-all ${
                    item.emergency
                      ? "text-rose-700 hover:bg-rose-100"
                      : isActive
                      ? "bg-[#F3E4C9] text-teal-900 border border-teal-800/30 shadow-2xs font-bold"
                      : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[8.5px] font-medium mt-0.5 tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom User Profile */}
        <div className="flex flex-col gap-3 items-center w-full relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-white text-slate-800 flex items-center justify-center text-xs font-bold cursor-pointer border border-[#D3D4C0] hover:scale-105 transition-all shadow-2xs"
            title="User Profile"
          >
            {user?.name?.[0] || "U"}
          </button>

          {showProfileMenu && (
            <div className="absolute bottom-2 left-14 bg-white border border-[#D3D4C0] text-slate-800 rounded-2xl w-64 p-4 shadow-xl z-50 flex flex-col gap-3 text-left animate-fadeIn">
              <div>
                <div className="text-sm font-bold text-slate-900">{user?.name}</div>
                <div className="text-[11px] text-teal-800 font-semibold uppercase font-mono mt-0.5">
                  {user?.role?.toUpperCase()} · {user?.facilityName || "Rural Sub-Centre"}
                </div>
              </div>

              <div className="h-px bg-[#D3D4C0]/50" />

              <div className="flex flex-col gap-1 text-[11px] text-slate-600 font-mono">
                {role === "asha" && <div>Incentive Balance: <strong className="text-teal-800 font-bold">Rs. {user?.incentivePoints || 1850}</strong></div>}
                <div>Tasks Completed: <strong className="text-slate-900">{user?.tasksCompletedThisMonth || 38}</strong></div>
                <div>Jurisdiction: <strong className="text-slate-900">{user?.village || "Pune Block"}</strong></div>
              </div>

              <div className="h-px bg-[#D3D4C0]/50" />

              <button
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl transition-all cursor-pointer border border-rose-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Expandable Patient Drawer (280px) - Warm Clinicians Style */}
      <aside
        className={`bg-[#FAF7F2] border-r border-[#D3D4C0] flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${
          drawerOpen ? "w-[280px]" : "w-0 border-r-0"
        }`}
      >
        <div className="w-[280px] flex flex-col h-full bg-[#FAF7F2]">
          {/* Drawer Header */}
          <div className="p-4 pb-3 flex flex-col gap-3 border-b border-[#D3D4C0] bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-serif font-bold text-slate-900 tracking-tight">Active Register</h2>
                <span className="px-2 py-0.5 bg-[#FAF7F2] border border-[#D3D4C0] text-slate-700 text-[10px] font-mono rounded-md font-bold">
                  {filteredPatients.length}
                </span>
              </div>
              <button
                onClick={() => navigate("/patients")}
                className="text-[10px] font-bold text-teal-800 hover:text-teal-950 cursor-pointer bg-transparent border-none p-0"
              >
                View All
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400 w-3.5 h-3.5" />
              <input
                className="w-full bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl py-1.5 pl-8 pr-3 text-slate-800 text-xs focus:outline-none focus:bg-white focus:border-teal-700 placeholder:text-slate-400 font-sans"
                placeholder="Search patient, ABHA, village..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Patient Session List with Clinicians Dashed-Circle Avatars */}
          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 no-scrollbar">
            {filteredPatients.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-10 px-3 font-sans">
                No matching patients found.
              </div>
            ) : (
              filteredPatients.map((p) => {
                const isActive = activePatientId === p._id;
                const isHighRisk = p.isHighRiskMaternal || p.riskTier === "high" || p.riskTier === "critical";

                return (
                  <div
                    key={p._id}
                    onClick={() => {
                      if (onSelectPatient) onSelectPatient(p);
                      navigate(`/patient/${p._id}`);
                    }}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl cursor-pointer transition-all text-left ${
                      isActive
                        ? "bg-white border border-teal-700 shadow-2xs"
                        : "hover:bg-white text-slate-700 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl border-2 border-dashed flex items-center justify-center text-[10.5px] font-bold shrink-0 ${
                        isHighRisk
                          ? "border-rose-400 bg-rose-50 text-rose-800"
                          : "border-[#D3D4C0] bg-white text-slate-800"
                      }`}
                    >
                      {getInitials(p)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                        {isHighRisk && (
                          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[8.5px] font-bold rounded uppercase">
                            High Risk
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                        {p.village} · {p.age}y ({p.gender[0].toUpperCase()})
                      </div>
                      <div className="text-[9.5px] text-teal-800 truncate mt-0.5 font-medium">
                        {p.conditions?.[0] || "General Case"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
