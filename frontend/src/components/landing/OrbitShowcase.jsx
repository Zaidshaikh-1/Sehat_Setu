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
  ChevronRight,
} from "lucide-react";

export function OrbitShowcase({ onNodeClick }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const actors = [
    {
      id: "asha",
      title: "Frontline ASHA Worker",
      subtitle: "First Point of Contact",
      desc: "Performs home visits, runs offline triage, registers ANC mothers, and relays emergency vitals.",
      color: "bg-teal-50 text-teal-900 border-teal-200",
      icon: Users,
    },
    {
      id: "doctor",
      title: "PHC Medical Officer",
      subtitle: "Primary Clinical Gatekeeper",
      desc: "Reviews triage, runs assisted teleconsultation, writes e-prescriptions, and verifies referrals.",
      color: "bg-blue-50 text-blue-900 border-blue-200",
      icon: Stethoscope,
    },
    {
      id: "hospital",
      title: "District Hospital Specialist",
      subtitle: "Tertiary Secondary Care",
      desc: "Receives incoming pre-booked referrals, admits high-risk cases, and closes audit loops.",
      color: "bg-purple-50 text-purple-900 border-purple-200",
      icon: Building,
    },
    {
      id: "pharmacy",
      title: "Essential Drug Pharmacy",
      subtitle: "Supply Chain Node",
      desc: "Live inventory visibility for critical maternal and life-saving drugs before patients travel.",
      color: "bg-emerald-50 text-emerald-900 border-emerald-200",
      icon: Pill,
    },
    {
      id: "lab",
      title: "Diagnostic & Lab Centre",
      subtitle: "Equipment Coordination",
      desc: "Machine uptime monitoring and digital test results synced to longitudinal ABHA record.",
      color: "bg-pink-50 text-pink-900 border-pink-200",
      icon: FlaskConical,
    },
    {
      id: "emergency",
      title: "108 Ambulance Dispatch",
      subtitle: "Emergency Response",
      desc: "1-tap SOS fast-track dispatch bypassing standard queues for obstetric and trauma emergencies.",
      color: "bg-rose-50 text-rose-900 border-rose-200",
      icon: ShieldAlert,
    },
  ];

  return (
    <section id="orbit" className="py-16 bg-white border-b border-slate-200 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 block mb-1">
          Ecosystem Interoperability
        </span>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Every Public Health Stakeholder Connected
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl">
          Setu replaces fragmented paper registers with a unified public health state machine across tiers.
        </p>

        {/* 6 Actors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-10 text-left">
          {actors.map((actor) => {
            const Icon = actor.icon;
            const isSelected = selectedNode?.id === actor.id;

            return (
              <div
                key={actor.id}
                onClick={() => setSelectedNode(actor)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-slate-50 hover:bg-white border-slate-200 hover:shadow-xs"
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                        isSelected ? "bg-slate-800 border-slate-700 text-teal-400" : actor.color
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? "text-slate-400" : "text-slate-500"}`}>
                      {actor.subtitle}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-base font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {actor.title}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                      {actor.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/40 text-xs font-semibold">
                  <span className={isSelected ? "text-teal-400" : "text-teal-700"}>
                    Inspect Workflow
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
