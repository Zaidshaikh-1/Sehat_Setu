import React, { useState } from "react";
import { Users, Stethoscope, Share2, CheckCircle2 } from "lucide-react";

export function PatientJourneyShowcase() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "step-1",
      role: "Meera Jadhav (ASHA Lead)",
      location: "Rampur Village Household",
      dialogue: "Namaste Sunita-tai, how are you feeling in your 28th week? Any headaches or swelling in your feet?",
      actionTaken: "ASHA measures Blood Pressure (148/94 mmHg) and checks pedal edema via peripheral kit.",
      systemEvent: "Triage Engine Flags: High-Risk Gestational Hypertension detected.",
      icon: Users,
    },
    {
      id: "step-2",
      role: "Assisted Teleconsultation",
      location: "Rampur Sub-Centre Link",
      dialogue: "Dr. Sharma reviews the live vitals on screen and speaks directly with Sunita-tai.",
      actionTaken: "Medical Officer prescribes oral antihypertensives and schedules Doppler Ultrasound.",
      systemEvent: "Consultation note generated and saved to Sunita Devi's ABHA Timeline.",
      icon: Stethoscope,
    },
    {
      id: "step-3",
      role: "Specialist Closed-Loop Referral",
      location: "Pune District Hospital (Obstetrics OPD)",
      dialogue: "Referral ticket generated with pre-allocated slot and transit accompaniment guidance.",
      actionTaken: "Patient arrives at District Hospital. Receiving specialist already has complete triage notes.",
      systemEvent: "Referral status transitions: Issued -> Traveling -> Arrived -> Seen & Closed.",
      icon: Share2,
    },
  ];

  const current = steps[activeStep];
  const Icon = current.icon;

  return (
    <section className="py-20 bg-[#fafafc] text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-2xl mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Real-World Clinical Narrative
          </span>
          <h2 className="text-3xl sm:text-5xl font-sans font-black text-slate-900 tracking-tight">
            The Patient Journey: Sunita Devi & ASHA Meera
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Step-by-step demonstration of how Setu prevents maternal complications through continuous inter-tier tracking.
          </p>
        </div>

        {/* 3 Step Timeline Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full mb-8">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`p-5 rounded-2xl text-left transition-all cursor-pointer border-none ${
                activeStep === idx
                  ? "bg-white shadow-md ring-2 ring-slate-900/10 text-slate-900"
                  : "bg-white/80 hover:bg-white shadow-xs text-slate-600"
              }`}
            >
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">
                Stage 0{idx + 1}
              </span>
              <h4 className="text-xs font-bold text-slate-900">{s.role}</h4>
              <span className="text-[11px] text-slate-500">{s.location}</span>
            </button>
          ))}
        </div>

        {/* Active Stage Card */}
        <div className="w-full bg-white rounded-3xl p-8 sm:p-10 text-left flex flex-col md:flex-row justify-between gap-8 items-start shadow-sm">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{current.role}</span>
                <span className="text-[11px] text-slate-500 font-mono">{current.location}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl text-slate-800 text-xs leading-relaxed font-normal">
              "{current.dialogue}"
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-slate-700 font-medium">
              <div><strong>Action:</strong> {current.actionTaken}</div>
            </div>
          </div>

          <div className="w-full md:w-80 bg-slate-50 rounded-2xl p-6 flex flex-col gap-3">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-600">
              System State Synchronization
            </span>
            <p className="text-xs text-slate-900 font-bold leading-snug">
              {current.systemEvent}
            </p>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Verified on ABDM Rails</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
