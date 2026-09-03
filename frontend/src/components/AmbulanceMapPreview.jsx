import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { Radio, ArrowRight, ShieldAlert, Phone, Navigation } from "lucide-react";

export function AmbulanceMapPreview({ telemetry, sosCode }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const navigate = useNavigate();

  const hospitalCoords = telemetry?.hospitalCoords || { lat: 18.56, lng: 73.80 };
  const patientCoords = telemetry?.patientCoords || { lat: 18.7512, lng: 73.4021 };
  const waypoints = telemetry?.routeWaypoints || [[hospitalCoords.lat, hospitalCoords.lng], [patientCoords.lat, patientCoords.lng]];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([patientCoords.lat, patientCoords.lng], 12);

      // Clean OpenStreetMap tiles
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
      L.marker([hospitalCoords.lat, hospitalCoords.lng], { icon: hospitalIcon }).addTo(map);

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
      L.marker([patientCoords.lat, patientCoords.lng], { icon: patientIcon }).addTo(map);

      // Route Polyline
      const polyline = L.polyline(waypoints, {
        color: "#E11D48",
        weight: 4,
        opacity: 0.8,
        dashArray: "6, 8",
      }).addTo(map);
      polylineRef.current = polyline;

      // Ambulance Vehicle Marker
      const ambulanceIcon = L.divIcon({
        className: "custom-ambulance-icon",
        html: `<div style="background-color: #1f2229; color: #FDA4AF; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid #E11D48; box-shadow: 0 4px 10px rgba(225,29,72,0.5); transform: rotate(0deg); transition: all 0.5s ease;">🚑</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const marker = L.marker([hospitalCoords.lat, hospitalCoords.lng], { icon: ambulanceIcon }).addTo(map);
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

  return (
    <div className="bg-white rounded-3xl border border-[#D3D4C0] overflow-hidden shadow-xs flex flex-col text-xs text-left animate-fadeIn">
      {/* Map Header */}
      <div className="p-4 bg-[#1f2229] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="font-mono font-bold text-rose-400 text-[11px] uppercase tracking-wider">
            Live 108 Fleet Telemetry
          </span>
        </div>

        <span className="text-[10px] font-mono text-slate-400">
          ETA: ~{telemetry?.etaMinutes || 12} mins ({telemetry?.distanceKm || "8.4"} km)
        </span>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[220px]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Route pill on top of map */}
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-[#D3D4C0] shadow-md flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-rose-600" />
            <div>
              <span className="font-bold text-slate-900 block leading-tight">
                {telemetry?.vehicleNumber || "MH-12-EM-1081"}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Driver: {telemetry?.driverName || "Sanjay Shinde"}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/ambulance-tracking/${sosCode || ""}`)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer border-none shadow-xs transition-all"
          >
            <span>Full Radar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
