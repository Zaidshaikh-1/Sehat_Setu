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
        { path: "/dashboard", label: "District Dashboard", icon: LayoutDashboard },
        { path: "/referrals", label: "Referral Tracking", icon: Share2 },
        { path: "/patients", label: "Patient Index", icon: Users },
        { path: "/medicine", label: "Pharmacy Stocks", icon: Pill },
        { path: "/diagnostics", label: "Diagnostic Uptime", icon: FlaskConical },
        { path: "/appointments", label: "OPD Load", icon: Calendar },
      ];
    }
    if (role === "doctor") {
      return [
        { path: "/consultation", label: "Teleconsultation", icon: Stethoscope },
        { path: "/patients", label: "Patient Records", icon: Users },
        { path: "/referrals", label: "Referral Orders", icon: Share2 },
        { path: "/diagnostics", label: "Lab Orders", icon: FlaskConical },
        { path: "/appointments", label: "Queue Tokens", icon: Calendar },
        { path: "/medicine", label: "Pharmacy Stock", icon: Pill },
        { path: "/triage", label: "Triage Reviews", icon: Activity },
      ];
    }
    // Default ASHA Frontline Worker tree
    return [
      { path: "/patients", label: "My Patients", icon: Users },
      { path: "/triage", label: "Field Triage", icon: Activity },
      { path: "/followup", label: "Daily Worklist", icon: ClipboardList },
      { path: "/consultation", label: "Teleconsult Link", icon: Stethoscope },
      { path: "/referrals", label: "Referral Status", icon: Share2 },
      { path: "/medicine", label: "Drug Checker", icon: Pill },
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
    <div className="flex h-full shrink-0 select-none relative z-40 bg-white">
      {/* 1. Left Narrow Icon Rail (68px) */}
      <aside className="w-[68px] bg-slate-900 flex flex-col items-center py-4 justify-between h-full shrink-0 border-r border-slate-800 text-white">
        {/* Top Section */}
        <div className="flex flex-col gap-4 items-center w-full">
          {/* Logo Brand Icon */}
          <div
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer hover:bg-teal-500 transition-colors"
            title="Setu Home"
          >
            SETU
          </div>

          {/* Quick Create Action */}
          <button
            onClick={() => {
              if (onNewTriage) onNewTriage();
              else navigate("/triage");
            }}
            className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center cursor-pointer border-none shadow-xs transition-all hover:scale-105"
            title="New Action"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>

          {/* Navigation Items */}
          <div className="flex flex-col gap-2 w-full items-center">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center cursor-pointer border-none transition-all ${
                    item.emergency
                      ? "text-rose-400 hover:bg-rose-950/60"
                      : isActive
                      ? "bg-teal-600 text-white font-bold"
                      : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[8px] font-semibold mt-0.5 tracking-tight">{item.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom User Profile */}
        <div className="flex flex-col gap-3 items-center w-full relative">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold cursor-pointer select-none border border-slate-600 hover:scale-105 transition-all shadow-xs"
              title="User Profile"
            >
              {user?.name?.[0] || "U"}
            </button>

            {showProfileMenu && (
              <div className="absolute bottom-2 left-14 bg-white border border-slate-200 text-slate-800 rounded-xl w-64 p-4 shadow-xl z-50 flex flex-col gap-3 text-left">
                <div>
                  <div className="text-sm font-bold text-slate-900">{user?.name}</div>
                  <div className="text-[11px] text-teal-700 font-semibold uppercase font-mono mt-0.5">
                    {user?.role?.toUpperCase()} · {user?.facilityName || "Rural Sub-Centre"}
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex flex-col gap-1 text-[11px] text-slate-600 font-mono">
                  {role === "asha" && <div>Incentive Balance: <strong className="text-teal-700 font-bold">Rs. {user?.incentivePoints || 1850}</strong></div>}
                  <div>Tasks Completed: <strong className="text-slate-900">{user?.tasksCompletedThisMonth || 38}</strong></div>
                  <div>Jurisdiction: <strong className="text-slate-900">{user?.village || "Pune Block"}</strong></div>
                </div>

                <div className="h-px bg-slate-100" />

                <button
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg transition-all cursor-pointer border border-rose-200 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Expandable Patient Drawer (280px) */}
      <aside
        className={`bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${
          drawerOpen ? "w-[280px]" : "w-0 border-r-0"
        }`}
      >
        <div className="w-[280px] flex flex-col h-full bg-slate-50">
          {/* Drawer Header */}
          <div className="p-4 pb-3 flex flex-col gap-3 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Active Register</h2>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded-md font-bold">
                  {filteredPatients.length}
                </span>
              </div>
              <button
                onClick={() => navigate("/patients")}
                className="text-[10px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer bg-transparent border-none p-0"
              >
                View All
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400 w-3.5 h-3.5" />
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-slate-800 text-xs focus:outline-none focus:bg-white focus:border-teal-600 placeholder:text-slate-400 font-sans"
                placeholder="Search patient, ABHA, village..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Patient Session List */}
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
                    className={`flex items-start gap-2.5 p-3 rounded-xl cursor-pointer transition-all text-left ${
                      isActive
                        ? "bg-white border border-teal-600 shadow-xs"
                        : "hover:bg-white text-slate-700 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isHighRisk
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {getInitials(p)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                        {isHighRisk && (
                          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[8.5px] font-bold rounded uppercase">
                            Alert
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                        {p.village} · {p.age}y ({p.gender[0].toUpperCase()})
                      </div>
                      <div className="text-[9.5px] text-teal-700 truncate mt-0.5 font-medium">
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
