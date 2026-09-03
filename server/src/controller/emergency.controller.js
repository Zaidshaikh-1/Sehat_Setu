import { Patient } from "../models/patient.models.js";
import { Facility } from "../models/facility.models.js";
import { Referral } from "../models/referral.models.js";
import { Record } from "../models/record.models.js";
import { BloodInventory, BloodDonor, BLOOD_COMPATIBILITY } from "../models/bloodbank.models.js";
import { getIo } from "../socket/io.store.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper to generate interpolated road waypoints between two coordinates
function generateRouteWaypoints(start, end, numPoints = 15) {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Add small realistic curvature/jitter to simulate winding rural roads
    const jitterLat = Math.sin(t * Math.PI) * 0.008 * (Math.random() * 0.4 + 0.8);
    const jitterLng = Math.sin(t * Math.PI * 2) * 0.006 * (Math.random() * 0.4 + 0.8);

    const lat = start.lat + (end.lat - start.lat) * t + jitterLat;
    const lng = start.lng + (end.lng - start.lng) * t + jitterLng;
    points.push([lat, lng]);
  }
  return points;
}

export const triggerSOS = asyncHandler(async (req, res) => {
  const {
    patientId,
    landmark = "Village Gram Panchayat Road",
    emergencyType = "Obstetric / Acute Trauma Emergency",
    latitude = 18.7512,
    longitude = 73.4021,
    notes = "",
  } = req.body;

  let patient = null;
  if (patientId) {
    patient = await Patient.findById(patientId);
  }

  if (!patient) {
    // Fallback emergency mock patient if triggered from public/unregistered kiosk
    patient = (await Patient.findOne({ isHighRiskMaternal: true })) || (await Patient.findOne());
  }

  const districtHospital =
    (await Facility.findOne({ tier: "district-hospital" })) ||
    (await Facility.findOne({ tier: "chc" })) ||
    (await Facility.findOne());

  const hospitalCoords = {
    lat: districtHospital?.location?.coordinates?.lat || 18.56,
    lng: districtHospital?.location?.coordinates?.lng || 73.80,
  };
  const patientCoords = {
    lat: parseFloat(latitude) || 18.7512,
    lng: parseFloat(longitude) || 73.4021,
  };

  const sosCode = `SOS-108-${Math.floor(100000 + Math.random() * 900000)}`;

  const emergencyReferral = await Referral.create({
    referralCode: sosCode,
    patient: patient._id,
    issuedBy: req.user?._id || patient.assignedAsha,
    fromFacility: req.user?.facility || patient.assignedFacility,
    toFacility: districtHospital._id,
    reason: `CRITICAL 1-TAP SOS: ${emergencyType} at ${landmark}`,
    department: "Emergency & Trauma Resuscitation",
    urgency: "emergency",
    status: "traveling",
    transportMode: "108 Ambulance",
    statusHistory: [
      {
        status: "issued",
        timestamp: new Date(),
        updatedBy: req.user?._id,
        updatedByName: req.user?.name || "Emergency SOS Caller",
        note: `1-Tap SOS Triggered at [${latitude}, ${longitude}], Near ${landmark}. Ambulance 108 Auto-Dispatched.`,
      },
      {
        status: "traveling",
        timestamp: new Date(),
        updatedBy: req.user?._id,
        updatedByName: "108 Fleet Controller",
        note: "Emergency ambulance en-route with paramedic stabilization kit.",
      },
    ],
  });

  // Longitudinal health record entry
  await Record.create({
    patient: patient._id,
    author: req.user?._id,
    facility: districtHospital._id,
    type: "emergency",
    title: `ONE-TAP EMERGENCY SOS TRIGGERED: ${sosCode}`,
    subtitle: `Dispatched to: ${districtHospital.name}`,
    summary: `Critical incident alert: ${emergencyType}. Patient dispatched via 108 Emergency Transport. Location: ${landmark} (${latitude}, ${longitude}). Blood Group: ${patient.bloodGroup || "O+"}.`,
  });

  // Auto-check Blood Availability & Match Community Donors
  const patientBlood = patient.bloodGroup || "O+";
  const compatibleTypes = BLOOD_COMPATIBILITY[patientBlood] || [patientBlood];

  // 1. Check hospital blood stock
  let hospitalStock = 0;
  try {
    const stockItems = await BloodInventory.find({
      facility: districtHospital._id,
      bloodType: { $in: compatibleTypes },
    });
    hospitalStock = stockItems.reduce((acc, curr) => acc + (curr.unitsAvailable || 0), 0);
  } catch (e) {
    console.error("Blood inventory check error:", e);
  }

  // 2. Find matching registered community donors near village
  let matchedDonors = [];
  try {
    matchedDonors = await BloodDonor.find({
      bloodType: { $in: compatibleTypes },
      isWilling: true,
      isEligible: true,
    })
      .select("name phone bloodType village age")
      .limit(4);
  } catch (e) {
    console.error("Donor query error:", e);
  }

  // Generate simulated route waypoints (Hospital -> Patient)
  const routeWaypoints = generateRouteWaypoints(hospitalCoords, patientCoords, 20);

  const telemetryData = {
    sosCode,
    driverName: "Sanjay Shinde",
    driverPhone: "+91 98229 10801",
    vehicleNumber: "MH-12-EM-1081",
    hospitalCoords,
    patientCoords,
    routeWaypoints,
    etaMinutes: 12,
    distanceKm: 8.4,
  };

  // Broadcast high-priority siren alert via Socket.IO
  const io = getIo();
  if (io) {
    io.emit("emergencyAlert", {
      type: "SOS_SIREN_TRIGGERED",
      sosCode,
      patientName: patient.name,
      abhaId: patient.abhaId,
      village: patient.village,
      bloodGroup: patientBlood,
      destinationFacility: districtHospital.name,
      landmark,
      coordinates: patientCoords,
      emergencyType,
      telemetry: telemetryData,
      bloodAvailability: {
        patientBlood,
        compatibleTypes,
        hospitalStockUnits: hospitalStock,
        matchedDonorsCount: matchedDonors.length,
      },
      timestamp: new Date(),
    });

    // Start ambulance tracking simulation if socket handler is listening
    io.emit("ambulance:trackStart", {
      sosCode,
      ...telemetryData,
    });
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        sosCode,
        patient,
        destinationFacility: districtHospital,
        referral: emergencyReferral,
        ambulanceDispatched: true,
        etaMinutes: 12,
        telemetry: telemetryData,
        bloodMatch: {
          patientBlood,
          compatibleTypes,
          hospitalStockUnits: hospitalStock,
          hospitalName: districtHospital.name,
          matchedDonors,
        },
      },
      "CRITICAL SOS ACTIVATED: 108 Ambulance dispatched & blood bank alerted."
    )
  );
});

export const getActiveEmergencies = asyncHandler(async (req, res) => {
  const emergencies = await Referral.find({
    urgency: "emergency",
    status: { $in: ["issued", "traveling", "arrived"] },
  })
    .populate("patient", "name abhaId age gender village phone bloodGroup")
    .populate("fromFacility", "name tier")
    .populate("toFacility", "name tier contactPhone inChargeDoctor location")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, emergencies, `Found ${emergencies.length} active emergency escalations`)
  );
});

