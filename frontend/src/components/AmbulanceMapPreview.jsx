import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { ArrowRight, Navigation, Gauge } from "lucide-react";
import {
  REALISTIC_ROAD_WAYPOINTS,
  getInterpolatedPoint,
} from "../utils/ambulanceRoute.js";

export function AmbulanceMapPreview({ telemetry, sosCode }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const traversedPolylineRef = useRef(null);
  const navigate = useNavigate();

  const [previewProgress, setPreviewProgress] = useState(0.2);

  // Auto-glide preview loop
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPreviewProgress((prev) => {
        const next = prev + 0.003;
        return next > 0.95 ? 0.05 : next;
      });
    }, 150);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const startPt = REALISTIC_ROAD_WAYPOINTS[0];
      const endPt = REALISTIC_ROAD_WAYPOINTS[REALISTIC_ROAD_WAYPOINTS.length - 1];

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(startPt, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Hospital Marker
      const hospitalIcon = L.divIcon({
        className: "custom-hospital-icon",
        html: `<div style="background-color: #0F766E; color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">H</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker(endPt, { icon: hospitalIcon }).addTo(map);

      // Patient Marker
      const patientIcon = L.divIcon({
        className: "custom-patient-icon",
        html: `<div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: 0; background-color: rgba(225,29,72,0.4); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 3px; background-color: #E11D48; border-radius: 9999px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker(startPt, { icon: patientIcon }).addTo(map);

      // Route Polyline (Upcoming)
      const polyline = L.polyline(REALISTIC_ROAD_WAYPOINTS, {
        color: "#E11D48",
        weight: 4,
        opacity: 0.8,
        dashArray: "6, 8",
      }).addTo(map);

      // Traversed Polyline (Emerald)
      const traversed = L.polyline([startPt], {
        color: "#10B981",
        weight: 4,
        opacity: 0.95,
      }).addTo(map);
      traversedPolylineRef.current = traversed;

      // Ambulance Vehicle Marker
      const ambulanceIcon = L.divIcon({
        className: "custom-ambulance-icon",
        html: `<div id="amb-preview-marker" style="background-color: #1f2229; color: #FDA4AF; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid #E11D48; box-shadow: 0 4px 10px rgba(225,29,72,0.5); transform: rotate(0deg); transition: transform 0.2s ease;">🚑</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const marker = L.marker(startPt, { icon: ambulanceIcon }).addTo(map);
      markerRef.current = marker;

      // Fit Bounds
      map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker along road
  useEffect(() => {
    if (!markerRef.current) return;
    const pt = getInterpolatedPoint(REALISTIC_ROAD_WAYPOINTS, previewProgress);
    markerRef.current.setLatLng([pt.lat, pt.lng]);

    const el = document.getElementById("amb-preview-marker");
    if (el) {
      el.style.transform = `rotate(${Math.round(pt.bearing)}deg)`;
    }

    if (traversedPolylineRef.current) {
      const splitIndex = pt.index;
      const traversedPts = [
        ...REALISTIC_ROAD_WAYPOINTS.slice(0, splitIndex + 1),
        [pt.lat, pt.lng],
      ];
      traversedPolylineRef.current.setLatLngs(traversedPts);
    }
  }, [previewProgress]);

  const remainingDist = (14.2 * (1 - previewProgress)).toFixed(1);
  const remainingMins = Math.round(18 * (1 - previewProgress));

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xs flex flex-col text-xs text-left animate-fadeIn">
      {/* Map Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="font-mono font-bold text-rose-400 text-[11px] uppercase tracking-wider">
            Live 108 Fleet Road Radar
          </span>
        </div>

        <span className="text-[10px] font-mono text-slate-300">
          ETA: ~{remainingMins} mins ({remainingDist} km)
        </span>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[230px]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Route pill on top of map */}
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-md flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-rose-600" />
            <div>
              <span className="font-bold text-slate-900 block leading-tight">
                {telemetry?.vehicleNumber || "MH-12-EM-1081"}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Driver: {telemetry?.driverName || "Sanjay Shinde"} · ALS Active
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/ambulance-tracking/${sosCode || ""}`)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer border-none shadow-xs transition-all"
          >
            <span>Full Radar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
