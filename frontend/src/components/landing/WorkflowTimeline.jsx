import React from "react";
import { Activity, Stethoscope, Share2, Award, ArrowRight } from "lucide-react";

export function WorkflowTimeline({ onExploreAsha, onOpenTriage, onOpenConsole }) {
  const steps = [
    {
      num: "01",
      title: "Community Triage & Danger Sign Detection",
      desc: "ASHA visits the household, gathers vitals using basic peripheral devices, and inputs symptoms into Setu's offline-ready triage decision engine.",
      icon: Activity,
    },
    {
      num: "02",
      title: "Teleconsultation & Clinical Order Entry",
      desc: "If risk tier requires medical evaluation, ASHA initiates an assisted teleconsultation with the PHC Medical Officer. Doctor authors electronic prescriptions.",
      icon: Stethoscope,
    },
    {
      num: "03",
      title: "Closed-Loop Referral State Machine",
      desc: "If tertiary care is needed, referral ticket is dispatched to District Hospital. State transitions from Issued to Traveling, Arrived, and Seen.",
      icon: Share2,
    },
    {
      num: "04",
      title: "Post-Discharge Follow-up & ASHA Incentive",
      desc: "Discharge summary automatically routes back to ASHA's daily worklist. Completing the home check-in automatically credits her activity incentive wallet.",
      icon: Award,
    },
  ];

  return (
    <section id="workflow" className="py-16 bg-slate-50 border-b border-slate-200 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
        <div className="text-center max-w-2xl mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Operational Blueprint
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            How Setu Completes the Care Loop
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Eliminating referral leakage by turning verbal doctor instructions into an auditable digital trail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-700">{s.num}</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                  Step {idx + 1} of 4
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
