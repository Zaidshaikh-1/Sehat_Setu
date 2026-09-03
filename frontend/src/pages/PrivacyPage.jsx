import React, { useEffect } from "react";
import { Navbar } from "../components/landing/Navbar.jsx";
import { FooterSection } from "../components/landing/FooterSection.jsx";

export function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col font-sans select-none overflow-x-clip text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-14 md:py-20 text-left">
        <div className="mb-14 border-b border-slate-200/80 pb-8 text-left">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-700 block mb-3">
            LEGAL & ABDM PRIVACY COMPLIANCE
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#22252a] font-bold tracking-tight leading-none">
            Privacy Policy & Data Security
          </h1>
        </div>

        <div className="text-base sm:text-lg text-slate-700 leading-relaxed mb-12 max-w-3xl">
          At Setu, we hold patient confidentiality and healthcare data integrity to the highest public standards. This Privacy Policy outlines our strict adherence to the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Ayushman Bharat Digital Mission (ABDM)</strong> health data management protocols.
        </div>

        <div className="flex flex-col gap-12 max-w-3xl">
          {/* Section 01 */}
          <section className="flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-widest">01 / REGULATORY ALIGNMENT</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22252a]">
              ABDM & DPDP Compliance
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Setu acts strictly as a public health workflow and clinical coordination intermediary. The patient remains the ultimate owner of their longitudinal health records, while the state healthcare department and registered clinicians act as Data Fiduciaries.
            </p>
          </section>

          {/* Section 02 */}
          <section className="flex flex-col gap-4">
            <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-widest">02 / INFORMATION PROCESSING</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22252a]">
              Information Collected & Processed
            </h2>
            <div className="flex flex-col gap-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              <div className="border-l-2 border-teal-700 pl-4 py-1">
                <strong className="text-[#22252a] block">ABHA Health Identifier:</strong>
                Used as the sole universal key to index patient encounters without replicating redundant PII across local facility silos.
              </div>
              <div className="border-l-2 border-teal-700 pl-4 py-1">
                <strong className="text-[#22252a] block">FHIR R4 Clinical Resources:</strong>
                Encounter summaries, vital records, triage scores, and prescriptions are formatted according to HL7 FHIR standards for nationwide health exchange.
              </div>
              <div className="border-l-2 border-teal-700 pl-4 py-1">
                <strong className="text-[#22252a] block">Zero Monetization Guarantee:</strong>
                Health records in Setu are never sold, rented, or utilized for commercial analytics or advertising.
              </div>
            </div>
          </section>

          {/* Section 03 */}
          <section className="flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-widest">03 / ENCRYPTION & ACCESS</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22252a]">
              End-to-End Encryption & RBAC
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              All communications across sub-centres, PHCs, and district hospitals utilize TLS 1.3 in-transit and AES-256 encryption at rest. Strict Role-Based Access Control (RBAC) ensures only assigned ASHAs, treating doctors, and verified administrators can view authorized patient records.
            </p>
          </section>

          {/* Section 04 */}
          <section className="flex flex-col gap-3 border-t border-slate-200/80 pt-8">
            <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-widest">04 / INQUIRIES</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22252a]">
              Privacy Desk
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              For privacy audits or ABDM compliance queries, contact our nodal grievance desk:
            </p>
            <p className="text-lg sm:text-xl font-bold text-[#22252a]">
              Email: <span className="text-teal-700 underline">privacy@setu.gov.in</span>
            </p>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
