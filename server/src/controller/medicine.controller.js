import { Medicine } from "../models/medicine.models.js";
import { Facility } from "../models/facility.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMedicines = asyncHandler(async (req, res) => {
  const { search, facilityId, category, isStockOut } = req.query;

  const query = {};
  if (facilityId) query.facility = facilityId;
  if (category) query.category = category;
  if (isStockOut !== undefined) query.isStockOut = isStockOut === "true";

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { genericName: { $regex: search, $options: "i" } },
    ];
  }

  const medicines = await Medicine.find(query)
    .populate("facility", "name tier location contactPhone")
    .sort({ isStockOut: -1, currentStock: 1 });

  return res.status(200).json(
    new ApiResponse(200, medicines, `Fetched ${medicines.length} pharmacy stock items`)
  );
});

export const updateMedicineStock = asyncHandler(async (req, res) => {
  const { medicineId } = req.params;
  const { currentStock, addedStock } = req.body;

  let medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    throw new ApiError(404, "Medicine stock record not found.");
  }

  if (currentStock !== undefined) {
    medicine.currentStock = Number(currentStock);
  } else if (addedStock !== undefined) {
    medicine.currentStock += Number(addedStock);
    medicine.lastRestockedAt = new Date();
  }

  medicine.isStockOut = medicine.currentStock <= medicine.minimumThreshold;
  await medicine.save();

  const populated = await Medicine.findById(medicine._id).populate("facility", "name tier");

  return res.status(200).json(
    new ApiResponse(200, populated, `Updated stock for ${medicine.name}: ${medicine.currentStock} ${medicine.unit}`)
  );
});

export const getStockOutAlerts = asyncHandler(async (req, res) => {
  const stockOuts = await Medicine.find({ isStockOut: true })
    .populate("facility", "name tier location inChargeDoctor contactPhone")
    .sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, stockOuts, `Found ${stockOuts.length} active pharmacy stock-out alerts`)
  );
});
