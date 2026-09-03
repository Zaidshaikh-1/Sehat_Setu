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
} from "lucide-react";

export function AmbulanceTrackingPage() {
  const { sosCode: paramSosCode } = useParams();
  const navigate = useNavigate();
  const [sosCode, setSosCode] = useState(paramSosCode || "SOS-108-DEMO");

  const [telemetry, setTelemetry] = useState({
    sosCode: paramSosCode || "SOS-108-DEMO",
    driverName: "Sanjay Shinde",
    driverPhone: "+91 98229 10801",
    vehicleNumber: "MH-12-EM-1081",
    hospitalCoords: { lat: 18.56, lng: 73.80 },
    patientCoords: { lat: 18.7512, lng: 73.4021 },
    lat: 18.56,
    lng: 73.80,
    progress: 0.15,
    status: "en-route",
    speedKmh: 54,
    distanceRemainingKm: 6.8,
    etaSeconds: 480,
  });

  const [arrived, setArrived] = useState(false);

  // Map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);

  // Default simulated waypoints
  const generateWaypoints = (start, end, count = 25) => {
    const pts = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const jitterLat = Math.sin(t * Math.PI) * 0.008;
      const jitterLng = Math.sin(t * Math.PI * 2) * 0.006;
      pts.push([start.lat + (end.lat - start.lat) * t + jitterLat, start.lng + (end.lng - start.lng) * t + jitterLng]);
    }
    return pts;
  };

  const waypoints = generateWaypoints(telemetry.hospitalCoords, telemetry.patientCoords, 25);

  // Socket Connection for live telemetry
  useEffect(() => {
    const socket = io(window.location.origin.includes("5173") ? "http://localhost:5050" : window.location.origin, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      socket.emit("ambulance:subscribe", { sosCode });
    });

    socket.on("ambulance:position", (data) => {
      if (data && (!data.sosCode || data.sosCode === sosCode || sosCode === "SOS-108-DEMO")) {
        setTelemetry((prev) => ({ ...prev, ...data }));
        if (data.progress >= 1 || data.status === "arrived") {
          setArrived(true);
        }

        // Update map marker
        if (markerRef.current && data.lat && data.lng) {
          markerRef.current.setLatLng([data.lat, data.lng]);
        }
      }
    });

    socket.on("ambulance:arrived", () => {
      setArrived(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [sosCode]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([telemetry.patientCoords.lat, telemetry.patientCoords.lng], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Hospital Marker
      const hospitalIcon = L.divIcon({
        className: "custom-hospital-icon",
        html: `<div style="background-color: #0F766E; color: white; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 15px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">H</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      L.marker([telemetry.hospitalCoords.lat, telemetry.hospitalCoords.lng], { icon: hospitalIcon })
        .addTo(map)
        .bindPopup("<b>Pune District Hospital</b><br>108 Dispatch Base");

      // Patient Marker
      const patientIcon = L.divIcon({
        className: "custom-patient-icon",
        html: `<div style="position: relative; width: 32px; height: 32px;">
          <div style="position: absolute; inset: 0; background-color: rgba(225,29,72,0.4); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 4px; background-color: #E11D48; border-radius: 9999px; border: 3px solid white; box-shadow: 0 4px 10px rgba(225,29,72,0.5);"></div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([telemetry.patientCoords.lat, telemetry.patientCoords.lng], { icon: patientIcon })
        .addTo(map)
        .bindPopup("<b>Patient Pickup Location</b><br>Rampur Village");

      // Polyline Route
      const polyline = L.polyline(waypoints, {
        color: "#E11D48",
        weight: 5,
        opacity: 0.85,
        dashArray: "8, 10",
      }).addTo(map);
      polylineRef.current = polyline;

      // Ambulance Moving Marker
      const ambulanceIcon = L.divIcon({
        className: "custom-ambulance-icon",
        html: `<div style="background-color: #1f2229; color: #FDA4AF; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; border: 3px solid #E11D48; box-shadow: 0 6px 16px rgba(225,29,72,0.6); transition: all 0.5s ease;">🚑</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      const marker = L.marker([telemetry.lat, telemetry.lng], { icon: ambulanceIcon }).addTo(map);
      markerRef.current = marker;

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Demo step simulator fallback if socket not ticking
  const handleAdvanceSimulation = () => {
    setTelemetry((prev) => {
      const nextProgress = Math.min(1, prev.progress + 0.15);
      const stepIdx = Math.floor(nextProgress * (waypoints.length - 1));
      const [nLat, nLng] = waypoints[stepIdx];
      const nDist = Math.max(0, parseFloat((8.4 * (1 - nextProgress)).toFixed(1)));
      const nEta = Math.max(0, Math.round(720 * (1 - nextProgress)));
      const nStatus = nextProgress >= 0.9 ? "arrived" : nextProgress > 0.6 ? "arriving" : "en-route";

      if (markerRef.current) {
        markerRef.current.setLatLng([nLat, nLng]);
      }

      if (nextProgress >= 1) setArrived(true);

      return {
        ...prev,
        progress: nextProgress,
        lat: nLat,
        lng: nLng,
        distanceRemainingKm: nDist,
        etaSeconds: nEta,
        status: nStatus,
      };
    });
  };

  const formatEta = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  return (
    <div className="relative w-full h-[calc(100vh-6rem)] -m-6 bg-[#1f2229] overflow-hidden flex flex-col font-sans text-slate-800">
      {/* Full-width Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Top Floating Glass Navigation Header */}
      <div className="relative z-30 p-4 sm:p-6 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate("/emergency")}
          className="pointer-events-auto px-4 py-2.5 bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md rounded-2xl border border-[#D3D4C0] shadow-md flex items-center gap-2 text-xs font-bold cursor-pointer transition-all hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Emergency</span>
        </button>

        <div className="pointer-events-auto bg-[#1f2229]/90 text-white backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-700 shadow-md flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="font-mono text-xs font-bold text-rose-400">RADAR ACTIVE · {sosCode}</span>
        </div>
      </div>

      {/* Top Status Stepper Card */}
      <div className="relative z-30 mx-auto max-w-xl w-full px-4 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#D3D4C0] shadow-lg flex items-center justify-between text-xs">
          {[
            { label: "Dispatched", active: true },
            { label: "En Route", active: telemetry.progress > 0.1 },
            { label: "Arriving", active: telemetry.progress > 0.65 },
            { label: "Arrived", active: telemetry.progress >= 0.95 || arrived },
          ].map((step, idx) => (
            <div key={step.label} className="flex items-center gap-1.5 font-mono">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step.active ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-500"
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

      {/* Floating Bottom Card — Swiggy / Zomato Live Driver Card Style */}
      <div className="relative z-30 mt-auto p-4 sm:p-6 max-w-2xl mx-auto w-full">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#D3D4C0] p-6 shadow-2xl flex flex-col gap-4 text-xs text-left animate-fadeIn">
          {/* Main ETA & Progress Strip */}
          <div className="flex items-center justify-between pb-3 border-b border-[#D3D4C0]/60">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-rose-600 block tracking-wider">
                {arrived ? "AMBULANCE ARRIVED ON SCENE" : "ESTIMATED TIME OF ARRIVAL"}
              </span>
              <h3 className="text-3xl font-serif font-black text-slate-900 tracking-tight mt-0.5">
                {arrived ? "Arrived at Location" : formatEta(telemetry.etaSeconds)}
              </h3>
            </div>

            <div className="flex flex-col items-end gap-1 font-mono">
              <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold text-xs">
                {telemetry.distanceRemainingKm} km remaining
              </span>
              <span className="text-[10px] text-slate-500">Speed: ~{telemetry.speedKmh} km/h</span>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round(telemetry.progress * 100)}%` }}
            />
          </div>

          {/* Driver & Paramedic Crew Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1f2229] text-rose-400 flex items-center justify-center font-serif text-xl font-black border border-slate-700 shrink-0">
                108
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-base text-slate-900">{telemetry.driverName}</h4>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-mono font-bold uppercase">
                    Paramedic Certified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Vehicle: <strong>{telemetry.vehicleNumber}</strong> · Advanced Life Support (ALS)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`tel:${telemetry.driverPhone}`}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer text-decoration-none shadow-xs transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Driver</span>
              </a>

              {/* Demo accelerator button for hackathon demo */}
              <button
                onClick={handleAdvanceSimulation}
                className="px-3 py-2.5 bg-[#1f2229] hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer border-none shadow-xs transition-all"
                title="Speed up simulation for demo"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-[10px]">Step</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
