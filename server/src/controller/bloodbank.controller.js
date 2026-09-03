import {
  BloodInventory,
  BloodDonor,
  BloodRequest,
  DonationHistory,
  BLOOD_GROUPS,
  BLOOD_COMPATIBILITY,
} from "../models/bloodbank.models.js";
import { Facility } from "../models/facility.models.js";
import { Patient } from "../models/patient.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper: Ensure default 8 blood groups exist for all facilities
async function ensureInventoryInitialized() {
  const facilities = await Facility.find();
  for (const fac of facilities) {
    for (const bg of BLOOD_GROUPS) {
      const defaultStock =
        fac.tier === "district-hospital"
          ? Math.floor(Math.random() * 8) + 4
          : fac.tier === "chc"
          ? Math.floor(Math.random() * 5) + 1
          : Math.floor(Math.random() * 3);

      await BloodInventory.findOneAndUpdate(
        { facility: fac._id, bloodType: bg },
        {
          $setOnInsert: {
            facility: fac._id,
            bloodType: bg,
            unitsAvailable: defaultStock,
            minimumThreshold: fac.tier === "district-hospital" ? 5 : 2,
          },
        },
        { upsert: true, new: true }
      );
    }
  }
}

// 1. Get Blood Inventory (aggregated across facilities or by specific facility)
export const getInventory = asyncHandler(async (req, res) => {
  await ensureInventoryInitialized();

  const { facilityId } = req.query;
  const filter = {};
  if (facilityId) {
    filter.facility = facilityId;
  }

  const inventory = await BloodInventory.find(filter)
    .populate("facility", "name tier location contactPhone")
    .sort({ bloodType: 1 });

  // Calculate summary totals per blood group
  const summary = {};
  BLOOD_GROUPS.forEach((bg) => {
    summary[bg] = 0;
  });

  inventory.forEach((item) => {
    if (summary[item.bloodType] !== undefined) {
      summary[item.bloodType] += item.unitsAvailable;
    }
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { inventory, summary, bloodGroups: BLOOD_GROUPS },
      "Blood inventory retrieved successfully"
    )
  );
});

// 2. Update stock for a blood type at a facility
export const updateInventory = asyncHandler(async (req, res) => {
  const { facilityId, bloodType, unitsChange, action } = req.body;

  if (!facilityId || !bloodType) {
    throw new ApiError(400, "Facility ID and blood type are required");
  }

  let item = await BloodInventory.findOne({ facility: facilityId, bloodType });
  if (!item) {
    item = new BloodInventory({
      facility: facilityId,
      bloodType,
      unitsAvailable: 0,
    });
  }

  const change = parseInt(unitsChange, 10) || 1;
  if (action === "deduct") {
    item.unitsAvailable = Math.max(0, item.unitsAvailable - change);
  } else {
    item.unitsAvailable += change;
  }

  item.lastUpdated = new Date();
  item.updatedBy = req.user?._id;
  await item.save();

  return res.status(200).json(
    new ApiResponse(200, item, `Updated ${bloodType} stock to ${item.unitsAvailable} units`)
  );
});

// 3. Register a new community donor
export const registerDonor = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    bloodType,
    age = 28,
    gender = "male",
    village = "Rampur",
    district = "Pune",
    state = "Maharashtra",
    latitude = 18.75,
    longitude = 73.40,
    isWilling = true,
  } = req.body;

  if (!name || !phone || !bloodType) {
    throw new ApiError(400, "Name, phone, and blood group are required");
  }

  if (!BLOOD_GROUPS.includes(bloodType)) {
    throw new ApiError(400, `Invalid blood type. Must be one of: ${BLOOD_GROUPS.join(", ")}`);
  }

  const donor = await BloodDonor.create({
    name,
    phone,
    bloodType,
    age,
    gender,
    village,
    district,
    state,
    coordinates: { lat: latitude, lng: longitude },
    isWilling,
    isEligible: true,
    lastDonationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago by default
    registeredBy: req.user?._id,
  });

  return res.status(201).json(
    new ApiResponse(201, donor, "Community blood donor registered successfully")
  );
});

// 4. Search and list donors
export const getDonors = asyncHandler(async (req, res) => {
  const { bloodType, village, compatibleFor, willingOnly } = req.query;

  const filter = {};

  if (willingOnly === "true" || willingOnly === true) {
    filter.isWilling = true;
    filter.isEligible = true;
  }

  if (compatibleFor && BLOOD_COMPATIBILITY[compatibleFor]) {
    // Search all compatible donor types for recipient
    filter.bloodType = { $in: BLOOD_COMPATIBILITY[compatibleFor] };
  } else if (bloodType && BLOOD_GROUPS.includes(bloodType)) {
    filter.bloodType = bloodType;
  }

  if (village) {
    filter.village = new RegExp(village, "i");
  }

  let donors = await BloodDonor.find(filter)
    .populate("registeredBy", "name role")
    .sort({ updatedAt: -1 });

  // If no donors exist yet, seed a few realistic community donors
  if (donors.length === 0 && !bloodType && !village) {
    const seedDonors = [
      { name: "Rahul Deshmukh", phone: "+91 98231 44810", bloodType: "O+", age: 29, village: "Rampur", isWilling: true },
      { name: "Pooja Gaikwad", phone: "+91 98232 55920", bloodType: "B+", age: 24, village: "Khandala", isWilling: true },
      { name: "Suresh Shinde", phone: "+91 98233 66030", bloodType: "A+", age: 35, village: "Rampur", isWilling: true },
      { name: "Amit Kadam", phone: "+91 98234 77140", bloodType: "O-", age: 31, village: "Aundh", isWilling: true },
      { name: "Deepak More", phone: "+91 98235 88250", bloodType: "AB+", age: 27, village: "Maval", isWilling: true },
      { name: "Kavita Chavan", phone: "+91 98236 99360", bloodType: "B-", age: 26, village: "Khandala", isWilling: true },
      { name: "Vikas Jagtap", phone: "+91 98237 10470", bloodType: "A-", age: 38, village: "Rampur", isWilling: true },
      { name: "Nitin Pawar", phone: "+91 98238 21580", bloodType: "O+", age: 33, village: "Maval", isWilling: true },
    ];
    await BloodDonor.insertMany(seedDonors);
    donors = await BloodDonor.find(filter);
  }

  return res.status(200).json(
    new ApiResponse(200, donors, `Found ${donors.length} blood donors`)
  );
});

// 5. Create clinical blood request & auto-match compatible donors
export const createBloodRequest = asyncHandler(async (req, res) => {
  const {
    patientId,
    patientName,
    facilityId,
    bloodType,
    unitsNeeded = 1,
    urgency = "urgent",
    notes = "",
  } = req.body;

  if (!bloodType || !BLOOD_GROUPS.includes(bloodType)) {
    throw new ApiError(400, "Valid blood type is required");
  }

  let patient = null;
  let pName = patientName;
  if (patientId) {
    patient = await Patient.findById(patientId);
    if (patient) pName = patient.name;
  }

  let facility = null;
  if (facilityId) {
    facility = await Facility.findById(facilityId);
  }
  if (!facility) {
    facility = (await Facility.findOne({ tier: "district-hospital" })) || (await Facility.findOne());
  }

  const requestCode = `BLD-REQ-${Math.floor(100000 + Math.random() * 900000)}`;

  // Auto-match compatible donors
  const compatibleTypes = BLOOD_COMPATIBILITY[bloodType] || [bloodType];
  const matchedDonors = await BloodDonor.find({
    bloodType: { $in: compatibleTypes },
    isWilling: true,
    isEligible: true,
  }).limit(5);

  const bloodReq = await BloodRequest.create({
    requestCode,
    patient: patient?._id,
    patientName: pName || "Emergency Trauma Patient",
    requestedBy: req.user?._id,
    facility: facility._id,
    bloodType,
    unitsNeeded,
    urgency,
    status: matchedDonors.length > 0 ? "matched" : "pending",
    matchedDonors: matchedDonors.map((d) => d._id),
    notes,
  });

  const populated = await BloodRequest.findById(bloodReq._id)
    .populate("facility", "name tier contactPhone")
    .populate("matchedDonors", "name phone bloodType village age");

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        request: populated,
        matchedCount: matchedDonors.length,
        compatibleTypes,
      },
      `Blood request ${requestCode} created with ${matchedDonors.length} auto-matched donors`
    )
  );
});

// 6. List blood requests
export const getBloodRequests = asyncHandler(async (req, res) => {
  const { status, urgency } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (urgency) filter.urgency = urgency;

  const requests = await BloodRequest.find(filter)
    .populate("facility", "name tier contactPhone")
    .populate("matchedDonors", "name phone bloodType village age")
    .populate("requestedBy", "name role")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, requests, `Found ${requests.length} blood requests`)
  );
});

// 7. Fulfill a blood request (and record history)
export const fulfillBloodRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { donorId, unitsFulfilled = 1, notes = "" } = req.body;

  const bloodReq = await BloodRequest.findById(id).populate("facility");
  if (!bloodReq) {
    throw new ApiError(404, "Blood request not found");
  }

  bloodReq.status = "fulfilled";
  bloodReq.fulfilledAt = new Date();
  if (notes) bloodReq.notes += ` [Fulfilled: ${notes}]`;
  await bloodReq.save();

  let donor = null;
  if (donorId) {
    donor = await BloodDonor.findById(donorId);
    if (donor) {
      donor.lastDonationDate = new Date();
      await donor.save();
    }
  }

  // Record Donation History
  const history = await DonationHistory.create({
    donor: donor?._id,
    donorName: donor?.name || "Community Volunteer Donor",
    patient: bloodReq.patient,
    patientName: bloodReq.patientName,
    facility: bloodReq.facility?._id,
    facilityName: bloodReq.facility?.name || "District Hospital",
    bloodType: bloodReq.bloodType,
    unitsDonated: unitsFulfilled,
    donatedAt: new Date(),
    recordedBy: req.user?._id,
  });

  return res.status(200).json(
    new ApiResponse(200, { request: bloodReq, history }, "Blood request fulfilled and donation recorded")
  );
});

// 8. Get Donation History Log
export const getDonationHistory = asyncHandler(async (req, res) => {
  const history = await DonationHistory.find()
    .populate("donor", "name phone bloodType village")
    .populate("facility", "name tier")
    .sort({ donatedAt: -1 })
    .limit(50);

  // If no history exists, seed a couple of entries
  if (history.length === 0) {
    const fac = (await Facility.findOne()) || { name: "Pune District Hospital", _id: null };
    const seedHistory = [
      { donorName: "Rahul Deshmukh", patientName: "Sunita Devi", facilityName: fac.name, bloodType: "O+", unitsDonated: 1, donatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { donorName: "Pooja Gaikwad", patientName: "Ramesh Patil", facilityName: fac.name, bloodType: "B+", unitsDonated: 1, donatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
    ];
    await DonationHistory.insertMany(seedHistory);
    const fresh = await DonationHistory.find().sort({ donatedAt: -1 });
    return res.status(200).json(new ApiResponse(200, fresh, "Donation history retrieved"));
  }

  return res.status(200).json(
    new ApiResponse(200, history, `Found ${history.length} donation records`)
  );
});

// 9. Get Blood Compatibility Matrix & Guide
export const getCompatibility = asyncHandler(async (req, res) => {
  const { bloodType } = req.params;

  if (bloodType) {
    const compatibleDonors = BLOOD_COMPATIBILITY[bloodType] || [];
    // Calculate recipients this type can donate to
    const canDonateTo = [];
    Object.keys(BLOOD_COMPATIBILITY).forEach((recipient) => {
      if (BLOOD_COMPATIBILITY[recipient].includes(bloodType)) {
        canDonateTo.push(recipient);
      }
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          bloodType,
          canReceiveFrom: compatibleDonors,
          canDonateTo,
          isUniversalDonor: bloodType === "O-",
          isUniversalRecipient: bloodType === "AB+",
        },
        `Compatibility for ${bloodType}`
      )
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        matrix: BLOOD_COMPATIBILITY,
        universalDonor: "O-",
        universalRecipient: "AB+",
      },
      "Blood compatibility matrix"
    )
  );
});
