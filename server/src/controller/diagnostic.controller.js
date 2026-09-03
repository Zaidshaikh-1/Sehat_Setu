import { Diagnostic } from "../models/diagnostic.models.js";
import { Facility } from "../models/facility.models.js";
import { Record } from "../models/record.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDiagnostics = asyncHandler(async (req, res) => {
  const { facilityId, category, isAvailable } = req.query;

  const query = {};
  if (facilityId) query.facility = facilityId;
  if (category) query.category = category;
  if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";

  const diagnostics = await Diagnostic.find(query)
    .populate("facility", "name tier location crowdLevel")
    .sort({ category: 1, testName: 1 });

  return res.status(200).json(
    new ApiResponse(200, diagnostics, `Fetched ${diagnostics.length} diagnostic test listings`)
  );
});

export const updateEquipmentStatus = asyncHandler(async (req, res) => {
  const { diagnosticId } = req.params;
  const { equipmentStatus } = req.body;

  const isAvailable = equipmentStatus === "working";

  const diagnostic = await Diagnostic.findByIdAndUpdate(
    diagnosticId,
    { equipmentStatus, isAvailable },
    { new: true }
  ).populate("facility", "name tier");

  if (!diagnostic) {
    throw new ApiError(404, "Diagnostic test not found.");
  }

  return res.status(200).json(
    new ApiResponse(200, diagnostic, `Equipment status for ${diagnostic.testName} set to: ${equipmentStatus}`)
  );
});

export const orderTest = asyncHandler(async (req, res) => {
  const { patientId, diagnosticId, urgency = "routine" } = req.body;

  const diagnostic = await Diagnostic.findById(diagnosticId).populate("facility", "name tier");
  if (!diagnostic) {
    throw new ApiError(404, "Diagnostic test not found.");
  }

  // Create longitudinal record
  const record = await Record.create({
    patient: patientId,
    author: req.user?._id,
    facility: diagnostic.facility?._id,
    type: "lab",
    title: `Lab Order (${urgency.toUpperCase()}): ${diagnostic.testName}`,
    subtitle: `Facility: ${diagnostic.facility?.name} | ETA: ${diagnostic.turnaroundHours} hours`,
    summary: `Sample ordered for ${diagnostic.testName} (${diagnostic.category}). Equipment is ${diagnostic.equipmentStatus}. Sample requirement: ${diagnostic.sampleRequirements}`,
    fhirResource: {
      resourceType: "ServiceRequest",
      status: "active",
      code: { text: diagnostic.testName },
    },
  });

  return res.status(201).json(
    new ApiResponse(201, record, `Diagnostic test order placed at ${diagnostic.facility?.name}`)
  );
});
