import React, { useState } from "react";
import {
  Users,
  Stethoscope,
  Building,
  Pill,
  FlaskConical,
  ShieldAlert,
  Activity,
  Award,
} from "lucide-react";

export function OrbitShowcase({ onNodeClick }) {
  const [activeNode, setActiveNode] = useState("asha");

  const nodes = [
    { id: "asha", label: "Frontline ASHA", tier: "Sub-Centre", icon: Users, desc: "Runs offline triage, registers ANC mothers, measures vitals, and logs village follow-ups." },
    { id: "phc", label: "PHC Medical Officer", tier: "Primary Health Centre", icon: Stethoscope, desc: "Conducts assisted teleconsultations, reviews triage alerts, and writes e-prescriptions." },
    { id: "chc", label: "Community Health Centre", tier: "Secondary Block Hub", icon: Building, desc: "Performs basic emergency obstetric care (BEmOC) and clinical stabilization." },
    { id: "hospital", label: "District Hospital", tier: "Tertiary Referral Care", icon: Building, desc: "Specialist surgery, C-section delivery, ICU management, and closed-loop feedback." },
    { id: "pharmacy", label: "Essential Drug Pharmacy", tier: "Supply Chain", icon: Pill, desc: "Real-time stock visibility for IFA, oxytocin, and antihypertensives across blocks." },
    { id: "lab", label: "Diagnostic Laboratory", tier: "Diagnostic Rail", icon: FlaskConical, desc: "Equipment uptime tracking and digital lab reports mapped directly to ABHA ID." },
    { id: "emergency", label: "108 Ambulance Dispatch", tier: "Fast-Track SOS", icon: ShieldAlert, desc: "Bypasses all queues with GPS telemetry for maternal and trauma emergencies." },
    { id: "admin", label: "District Health Officer", tier: "Administrative Governance", icon: Activity, desc: "District-wide accountability metrics, referral completion audits, and stock-out alerts." },
    { id: "abha", label: "National ABHA Rails", tier: "Interoperability Standard", icon: Award, desc: "Universal health identifier and HL7 FHIR R4 standardized longitudinal care timeline." },
  ];

  const currentNode = nodes.find((n) => n.id === activeNode) || nodes[0];
  const CurrentIcon = currentNode.icon;

  return (
    <section id="orbit" className="py-20 bg-[#fafafc] text-slate-800 font-sans relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Systemic Interoperability
          </span>
          <h2 className="text-3xl sm:text-5xl font-sans font-black text-slate-900 tracking-tight">
            The Rural Care Ecosystem, Synchronized.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Click any node in the care orbit to inspect how Setu maintains unbroken continuity between community and hospital.
          </p>
        </div>

        {/* Orbit Graphics + Interactive Showcase */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Concentric Orbit Rings (7 cols) */}
          <div className="lg:col-span-7 flex items-center justify-center p-6 relative min-h-[420px]">
            {/* SVG Orbit Tracks */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center orbit-container">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-slate-200 animate-orbit-outer" />
              {/* Inner Ring */}
              <div className="absolute inset-8 sm:inset-10 rounded-full border border-slate-200 animate-orbit-inner-reverse" />

              {/* Central Core Hub */}
              <div className="w-24 h-24 rounded-full bg-white shadow-lg flex flex-col items-center justify-center z-20">
                <span className="font-sans font-black text-base text-slate-900 tracking-tight">SETU</span>
                <span className="text-[8.5px] font-mono text-slate-500 font-bold uppercase">Care Bridge</span>
              </div>

              {/* Orbiting Satellite Node Buttons */}
              {nodes.slice(0, 8).map((node, idx) => {
                const angle = (idx / 8) * (2 * Math.PI);
                const radius = 140; // px
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const Icon = node.icon;
                const isSelected = activeNode === node.id;

                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveNode(node.id)}
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                    className={`absolute w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all shadow-xs z-30 border-none ${
                      isSelected
                        ? "bg-slate-900 text-white scale-110 shadow-md"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                    title={node.label}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Node Card (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-sm flex flex-col justify-between gap-6 text-left animate-fadeIn">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                  {currentNode.tier}
                </span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
                  <CurrentIcon className="w-4.5 h-4.5" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-sans font-bold text-slate-900">
                  {currentNode.label}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-sans">
                  {currentNode.desc}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-mono text-slate-700">
              <span>National ABDM Interoperability</span>
              <strong className="text-slate-900">READY</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
