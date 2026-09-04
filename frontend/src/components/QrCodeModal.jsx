import React, { useState, useEffect } from "react";
import { api } from "../utils/api.js";
import {
  QrCode,
  Printer,
  Copy,
  Check,
  ExternalLink,
  X,
  Loader2,
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowRight,
  UserCheck
} from "lucide-react";

export function QrCodeModal({ referral, referralId, onClose }) {
  const targetId = referralId || referral?._id;
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!targetId) return;

    const fetchQr = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/qr/${targetId}`);
        if (res.data?.data) {
          setQrData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load QR code", err);
        setError("Could not generate QR code. Please check your backend connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, [targetId]);

  const handleCopyLink = () => {
    if (qrData?.scanUrl) {
      navigator.clipboard.writeText(qrData.scanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Referral Pass - ${qrData?.referralCode || "QR Pass"}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 40px;
              color: #1e293b;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            .pass-card {
              border: 2px solid #0f766e;
              border-radius: 16px;
              padding: 28px;
              max-width: 440px;
              width: 100%;
              background: #fafaf9;
            }
            .header {
              font-size: 20px;
              font-weight: 800;
              color: #134e4a;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .sub {
              font-size: 12px;
              color: #64748b;
              margin-bottom: 20px;
            }
            .qr-img {
              width: 240px;
              height: 240px;
              margin: 12px auto;
              border: 1px solid #cbd5e1;
              border-radius: 12px;
              padding: 8px;
              background: #fff;
            }
            .code-badge {
              display: inline-block;
              font-family: monospace;
              font-size: 16px;
              font-weight: 700;
              background: #ccfbf1;
              color: #115e59;
              padding: 6px 14px;
              border-radius: 8px;
              margin: 10px 0;
            }
            .patient-info {
              font-size: 14px;
              font-weight: 600;
              color: #334155;
              margin: 6px 0;
            }
            .instructions {
              font-size: 11px;
              color: #64748b;
              margin-top: 16px;
              line-height: 1.4;
              border-top: 1px dashed #cbd5e1;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="pass-card">
            <div class="header">SEHAT SETU REFERRAL PASS</div>
            <div class="sub">National Rural Health Transit & Care Continuum</div>
            <div class="code-badge">${qrData?.referralCode || "SETU-REF"}</div>
            <div class="patient-info">Patient: ${referral?.patient?.name || qrData?.patientName || "Patient"}</div>
            ${qrData?.qrDataUrl ? `<img class="qr-img" src="${qrData.qrDataUrl}" alt="QR" />` : ""}
            <div class="instructions">
              <strong>Checkpoints:</strong><br/>
              1. Scan to start transit (Travelling)<br/>
              2. Scan upon arrival at receiving facility (Admitted)<br/>
              3. Scan after consultation to discharge (Discharged)
            </div>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-[#D3D4C0] rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-left relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#D3D4C0] hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 text-teal-800">
            <QrCode className="w-5 h-5" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Transit Checkpoint QR Code
            </span>
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900 mt-1">
            Patient Referral Pass
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            Scan at each transit checkpoint to update status automatically.
          </p>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
            <span className="text-xs text-slate-500 font-mono">Generating secure QR code...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs text-center">
            {error}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {/* QR Card */}
            <div className="bg-[#FAF7F2] border-2 border-dashed border-teal-700/40 rounded-2xl p-4 flex flex-col items-center text-center w-full">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                {qrData?.qrDataUrl && (
                  <img
                    src={qrData.qrDataUrl}
                    alt="Referral QR Code"
                    className="w-48 h-48 rounded-lg object-contain"
                  />
                )}
              </div>

              <div className="mt-3 flex flex-col items-center">
                <span className="text-xs font-mono font-bold text-teal-900 bg-teal-100/80 px-3 py-1 rounded-lg border border-teal-300/60">
                  {qrData?.referralCode || referral?.referralCode}
                </span>
                <span className="text-sm font-bold text-slate-800 mt-1">
                  {referral?.patient?.name || qrData?.patientName || "Patient"}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Current Status: <strong className="uppercase text-teal-800">{referral?.status || qrData?.currentStatus}</strong>
                </span>
              </div>
            </div>

            {/* Checkpoint Milestones info */}
            <div className="w-full bg-teal-50/50 border border-teal-200/60 rounded-xl p-3 flex flex-col gap-1.5 text-[11px]">
              <div className="font-bold text-teal-950 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                Scan Milestones:
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] mt-1 font-mono">
                <div className="p-1.5 rounded-lg bg-white border border-teal-200 text-teal-900">
                  1. Traveling
                </div>
                <div className="p-1.5 rounded-lg bg-white border border-teal-200 text-purple-900">
                  2. Admitted
                </div>
                <div className="p-1.5 rounded-lg bg-white border border-teal-200 text-emerald-900">
                  3. Discharged
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 w-full mt-1">
              <button
                onClick={handlePrint}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-[#D3D4C0] rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Print Pass
              </button>

              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-[#D3D4C0] rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied Link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    Copy Scan Link
                  </>
                )}
              </button>
            </div>

            {/* Open Scan Page directly (for preview/testing) */}
            <a
              href={qrData?.scanUrl || `/scan/${targetId}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Scanner Checkpoint View
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
