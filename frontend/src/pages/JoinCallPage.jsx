import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWebRTC } from "../hooks/useWebRTC.js";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Stethoscope,
  Activity,
  HeartPulse,
  User,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

export function JoinCallPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("asha"); // asha, patient, attendant
  const [hasJoined, setHasJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
    localStream,
    remoteStream,
    isConnected,
    isCallActive,
    isAudioMuted,
    isVideoMuted,
    remoteUser,
    callStatus,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useWebRTC({
    roomId,
    userName: userName || (userRole === "asha" ? "ASHA Worker" : "Patient"),
    userRole,
    autoStart: false,
  });

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, hasJoined]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, hasJoined]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setHasJoined(true);
    await startCall();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 font-sans flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Top App Branding */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
            S
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-[#1f2229] leading-tight">SETU Teleconsultation</h1>
            <p className="text-[10px] font-mono text-teal-800 font-bold uppercase tracking-wider">
              Rural Health Secure Tele-Link
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white border border-[#D3D4C0] rounded-xl text-[11px] font-mono font-bold text-slate-600 flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Room: {roomId?.slice(0, 10)}...</span>
          </span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl text-[11px] font-mono font-bold cursor-pointer transition-all"
          >
            {copied ? "✓ Copied!" : "Share Link"}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-4xl">
        {!hasJoined ? (
          /* Pre-Join Lobby Card */
          <div className="bg-white rounded-3xl border border-[#D3D4C0] shadow-md p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center">
            {/* Left Preview Box */}
            <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
              <div className="w-full aspect-video bg-[#1f2229] rounded-2xl border border-slate-700 overflow-hidden flex flex-col items-center justify-center relative shadow-inner">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-teal-500/40 flex items-center justify-center mb-2">
                  <Stethoscope className="w-8 h-8 text-teal-400" />
                </div>
                <p className="text-xs text-slate-400 font-mono">Camera & Mic will start upon joining</p>
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-mono text-teal-300 border border-teal-500/30">
                  Ready to Connect
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> WebRTC P2P
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> End-to-End Encrypted
                </span>
              </div>
            </div>

            {/* Right Form Box */}
            <div className="w-full md:w-1/2 flex flex-col gap-4 text-left">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-teal-800 tracking-wider">
                  Patient / ASHA Tele-Portal
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1f2229]">Join Teleconsultation</h2>
                <p className="text-xs text-slate-600 mt-1">
                  You are connecting directly with the Medical Officer at District Hospital / PHC.
                </p>
              </div>

              <form onSubmit={handleJoin} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ASHA Meera Devi / Sunita Bai"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Connecting As</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "asha", label: "ASHA Worker", icon: "👩‍⚕️" },
                      { id: "patient", label: "Patient", icon: "🧑" },
                      { id: "attendant", label: "Caregiver", icon: "👨‍👩‍👦" },
                    ].map((role) => (
                      <button
                        type="button"
                        key={role.id}
                        onClick={() => setUserRole(role.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                          userRole === role.id
                            ? "bg-teal-900 text-white border-teal-900 shadow-sm"
                            : "bg-[#FAF7F2] border-[#D3D4C0] text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-base">{role.icon}</span>
                        <span className="text-[11px]">{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-teal-800 to-teal-950 hover:from-teal-900 hover:to-black text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none mt-2"
                >
                  <PhoneCall className="w-4 h-4 text-teal-300" />
                  <span>Enter Video Room</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Active Call Room */
          <div className="bg-[#1f2229] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col gap-4 text-white">
            {/* Top Bar inside Video Call */}
            <div className="flex items-center justify-between flex-wrap gap-2 px-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-teal-950 border border-teal-700 text-teal-300 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-teal-400 animate-pulse" : "bg-amber-400"}`} />
                  <span>{isConnected ? "Connected with Doctor" : "Waiting for Doctor to connect..."}</span>
                </span>
              </div>

              <div className="text-xs font-mono text-slate-400">
                You: <strong className="text-white">{userName || "ASHA"}</strong> ({userRole.toUpperCase()})
              </div>
            </div>

            {/* Video Streams Canvas Area */}
            <div className="relative w-full aspect-video sm:min-h-[460px] bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {/* Remote Stream Video */}
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-center p-6">
                  <div className="w-20 h-20 rounded-full bg-slate-800/80 border-2 border-teal-500/40 flex items-center justify-center animate-pulse">
                    <Stethoscope className="w-10 h-10 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">
                      {remoteUser?.userName || "Medical Officer (Doctor)"}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      {isConnected ? "Incoming audio/video active" : "Connecting to peer stream via WebRTC..."}
                    </p>
                  </div>
                </div>
              )}

              {/* Local Video Picture-in-Picture (PIP) */}
              <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video bg-slate-900 border-2 border-teal-500/60 rounded-xl overflow-hidden shadow-2xl z-20">
                {localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono">
                    <User className="w-4 h-4 mb-1 text-slate-500" />
                    <span>Your Cam</span>
                  </div>
                )}
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-[9px] font-mono text-white">
                  You
                </div>
              </div>
            </div>

            {/* In-Call Controls Bar */}
            <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAudio}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all ${
                    isAudioMuted ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                  title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all ${
                    isVideoMuted ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                  title={isVideoMuted ? "Start Camera" : "Stop Camera"}
                >
                  {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>

              {/* End Call Button */}
              <button
                onClick={() => {
                  endCall();
                  setHasJoined(false);
                }}
                className="px-5 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center gap-2 cursor-pointer border-none transition-all shadow-md bg-rose-600 hover:bg-rose-700 text-white"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Disconnect Call</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
