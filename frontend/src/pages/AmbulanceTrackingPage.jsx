import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import L from "leaflet";
import {
  Navigation,
  Phone,
  ShieldAlert,
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  Radio,
  Activity,
  HeartPulse,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Zap,
} from "lucide-react";
import {
  REALISTIC_ROAD_WAYPOINTS,
  getInterpolatedPoint,
} from "../utils/ambulanceRoute.js";

export function AmbulanceTrackingPage() {
  const { sosCode: paramSosCode } = useParams();
  const navigate = useNavigate();
  const [sosCode] = useState(paramSosCode || "SOS-108-DEMO");

  // Telemetry state
  const [progress, setProgress] = useState(0.08); // Starts at 8% along road
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [arrived, setArrived] = useState(false);

  const initialDistanceKm = 14.2;
  const initialEtaMinutes = 18;

  const [telemetry, setTelemetry] = useState({
    sosCode: paramSosCode || "SOS-108-DEMO",
    driverName: "Sanjay Shinde",
    driverPhone: "+91 98229 10801",
    paramedicName: "Sunil Gokhale (EMT)",
    vehicleNumber: "MH-12-EM-1081",
    hospitalName: "Pune District General Hospital (DH Aundh)",
    pickupLocation: "Rampur Sub-Centre Gate",
    lat: REALISTIC_ROAD_WAYPOINTS[0][0],
    lng: REALISTIC_ROAD_WAYPOINTS[0][1],
    bearing: 0,
    speedKmh: 58,
    distanceRemainingKm: initialDistanceKm,
    etaSeconds: initialEtaMinutes * 60,
    status: "en-route",
    oxygenLevel: "98% Full",
    alsActive: true,
  });

  // Leaflet refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const ambulanceMarkerRef = useRef(null);
  const traversedPolylineRef = useRef(null);
  const upcomingPolylineRef = useRef(null);
  const animFrameRef = useRef(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const startPt = REALISTIC_ROAD_WAYPOINTS[0];
      const endPt = REALISTIC_ROAD_WAYPOINTS[REALISTIC_ROAD_WAYPOINTS.length - 1];

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView(startPt, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Start Marker (Patient / Sub-Centre)
      const patientIcon = L.divIcon({
        className: "custom-patient-icon",
        html: `<div style="position: relative; width: 34px; height: 34px;">
          <div style="position: absolute; inset: 0; background-color: rgba(225,29,72,0.3); border-radius: 9999px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 4px; background-color: #E11D48; border-radius: 9999px; border: 3px solid white; box-shadow: 0 4px 12px rgba(225,29,72,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold;">📍</div>
        </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      L.marker(startPt, { icon: patientIcon })
        .addTo(map)
        .bindPopup("<b>Patient Location / Sub-Centre</b><br>Rampur Ayushman Arogya Mandir");

      // End Marker (District Hospital)
      const hospitalIcon = L.divIcon({
        className: "custom-hospital-icon",
        html: `<div style="background-color: #0F766E; color: white; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; border: 2.5px solid white; box-shadow: 0 6px 14px rgba(15,118,110,0.5);">H</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker(endPt, { icon: hospitalIcon })
        .addTo(map)
        .bindPopup("<b>Pune District General Hospital</b><br>Emergency Trauma Bay 1");

      // Full Route polyline (Upcoming in red dashed)
      const upcomingLine = L.polyline(REALISTIC_ROAD_WAYPOINTS, {
        color: "#E11D48",
        weight: 6,
        opacity: 0.85,
        dashArray: "8, 10",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      upcomingPolylineRef.current = upcomingLine;

      // Traversed route polyline (Solid Emerald/Teal)
      const traversedLine = L.polyline([startPt], {
        color: "#10B981",
        weight: 6,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      traversedPolylineRef.current = traversedLine;

      // Moving Ambulance Marker with Direction Indicator
      const ambulanceIcon = L.divIcon({
        className: "custom-ambulance-marker",
        html: `<div id="amb-vehicle-icon" style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; transform: rotate(0deg); transition: transform 0.2s ease;">
          <div style="position: absolute; inset: 0; background-color: rgba(225,29,72,0.25); border-radius: 50%; animation: ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width: 38px; height: 38px; background: #1f2229; border: 2.5px solid #E11D48; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 19px; box-shadow: 0 6px 16px rgba(0,0,0,0.4);">
            🚑
          </div>
        </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const ambMarker = L.marker(startPt, { icon: ambulanceIcon }).addTo(map);
      ambulanceMarkerRef.current = ambMarker;

      map.fitBounds(upcomingLine.getBounds(), { padding: [60, 60] });
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Smooth Automatic Road-to-Road Gliding Animation Loop
  useEffect(() => {
    if (!isPlaying || arrived) return;

    const baseStep = 0.0012; // Smooth fractional increment per tick
    const intervalMs = 100; // 10 updates per second for buttery glide

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        const next = prev + baseStep * speedMultiplier;
        if (next >= 1) {
          setArrived(true);
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [isPlaying, speedMultiplier, arrived]);

  // Update Telemetry & Map Marker dynamically when progress advances
  useEffect(() => {
    const currentPoint = getInterpolatedPoint(REALISTIC_ROAD_WAYPOINTS, progress);

    const distRemaining = Math.max(0, parseFloat((initialDistanceKm * (1 - progress)).toFixed(1)));
    const etaSecs = Math.max(0, Math.round(initialEtaMinutes * 60 * (1 - progress)));

    // Fluctuating realistic speed based on road curvature
    const speed = progress >= 1 ? 0 : Math.round(52 + Math.sin(progress * 25) * 12);
    const status = progress >= 0.96 ? "arrived" : progress > 0.7 ? "approaching" : "en-route";

    setTelemetry((prev) => ({
      ...prev,
      lat: currentPoint.lat,
      lng: currentPoint.lng,
      bearing: currentPoint.bearing,
      distanceRemainingKm: distRemaining,
      etaSeconds: etaSecs,
      speedKmh: speed,
      status,
    }));

    // Update Leaflet Marker Position & Heading
    if (ambulanceMarkerRef.current) {
      ambulanceMarkerRef.current.setLatLng([currentPoint.lat, currentPoint.lng]);

      const iconEl = document.getElementById("amb-vehicle-icon");
      if (iconEl) {
        iconEl.style.transform = `rotate(${Math.round(currentPoint.bearing)}deg)`;
      }
    }

    // Update Traversed Polyline (green path) & Remaining Polyline (red path)
    if (traversedPolylineRef.current && upcomingPolylineRef.current) {
      const splitIndex = currentPoint.index;
      const traversedPts = [
        ...REALISTIC_ROAD_WAYPOINTS.slice(0, splitIndex + 1),
        [currentPoint.lat, currentPoint.lng],
      ];
      const upcomingPts = [
        [currentPoint.lat, currentPoint.lng],
        ...REALISTIC_ROAD_WAYPOINTS.slice(splitIndex + 1),
      ];

      traversedPolylineRef.current.setLatLngs(traversedPts);
      upcomingPolylineRef.current.setLatLngs(upcomingPts);
    }
  }, [progress]);

  // Socket Connection for multi-client synchronisation
  useEffect(() => {
    const socket = io(window.location.origin.includes("5173") ? "http://localhost:5050" : window.location.origin, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      socket.emit("ambulance:subscribe", { sosCode });
    });

    socket.on("ambulance:position", (data) => {
      if (data && data.progress !== undefined) {
        setProgress(data.progress);
        if (data.progress >= 1) setArrived(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [sosCode]);

  const handleReset = () => {
    setProgress(0.01);
    setArrived(false);
    setIsPlaying(true);
  };

  const formatEta = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  return (
    <div className="relative w-full h-[calc(100vh-6rem)] -m-6 bg-[#fafafc] overflow-hidden flex flex-col font-sans text-slate-800">
      {/* Full-width Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Top Floating Header */}
      <div className="relative z-30 p-4 sm:p-6 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate("/emergency")}
          className="pointer-events-auto px-4 py-2.5 bg-white/95 hover:bg-white text-slate-900 backdrop-blur-md rounded-2xl shadow-md flex items-center gap-2 text-xs font-bold cursor-pointer transition-all hover:scale-105 border-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Emergency</span>
        </button>

        <div className="pointer-events-auto bg-slate-900/95 text-white backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="font-mono text-xs font-bold text-rose-400">
            AUTONOMOUS ROAD RADAR · {sosCode}
          </span>
        </div>
      </div>

      {/* Top Status Stepper Card */}
      <div className="relative z-30 mx-auto max-w-xl w-full px-4 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center justify-between text-xs">
          {[
            { label: "Dispatched", active: true },
            { label: "En Route via Highway", active: progress > 0.15 },
            { label: "Approaching Bay", active: progress > 0.75 },
            { label: "Handover Arrived", active: progress >= 0.98 || arrived },
          ].map((step, idx) => (
            <div key={step.label} className="flex items-center gap-1.5 font-mono">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step.active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {step.active ? "✓" : idx + 1}
              </div>
              <span className={`text-[11px] font-bold ${step.active ? "text-slate-900" : "text-slate-400"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Card — Modern Delivery Style Live Navigation Panel */}
      <div className="relative z-30 mt-auto p-4 sm:p-6 max-w-2xl mx-auto w-full">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-xs text-left animate-fadeIn">
          {/* Main ETA & Speed Strip */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-rose-600 block tracking-wider">
                {arrived ? "AMBULANCE ARRIVED AT HOSPITAL BAY" : "LIVE ESTIMATED TIME OF ARRIVAL"}
              </span>
              <h3 className="text-3xl font-sans font-black text-slate-900 tracking-tight mt-0.5">
                {arrived ? "Arrived at Emergency Bay" : formatEta(telemetry.etaSeconds)}
              </h3>
            </div>

            <div className="flex flex-col items-end gap-1 font-mono">
              <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-xl font-bold text-xs">
                {telemetry.distanceRemainingKm} km remaining
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <Gauge className="w-3.5 h-3.5 text-teal-600" />
                <span>Speed: {telemetry.speedKmh} km/h</span>
              </div>
            </div>
          </div>

          {/* Road Traversal Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Rampur Sub-Centre</span>
              <span className="font-bold text-slate-800">{Math.round(progress * 100)}% Road Covered</span>
              <span>Pune District Hospital</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>

          {/* Driver & Crew Details + Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-rose-400 flex items-center justify-center font-sans text-lg font-black shrink-0">
                108
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-sans font-bold text-sm text-slate-900">{telemetry.driverName}</h4>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-mono font-bold uppercase">
                    ALS Paramedic Onboard
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Vehicle: <strong>{telemetry.vehicleNumber}</strong> · Advanced Life Support (ALS)
                </p>
              </div>
            </div>

            {/* Live Playback & Multiplier Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl cursor-pointer border-none transition-all"
                title={isPlaying ? "Pause automated glide" : "Resume automated road navigation"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextMult = speedMultiplier === 1 ? 2 : speedMultiplier === 2 ? 5 : 1;
                  setSpeedMultiplier(nextMult);
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-mono text-[11px] font-bold cursor-pointer border-none transition-all flex items-center gap-1"
                title="Simulation speed multiplier"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>{speedMultiplier}x</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl cursor-pointer border-none transition-all"
                title="Restart route"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <a
                href={`tel:${telemetry.driverPhone}`}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer text-decoration-none shadow-xs transition-all text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Driver</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
