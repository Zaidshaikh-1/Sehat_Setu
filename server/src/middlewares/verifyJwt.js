import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.query?.token;

    if (!token) {
      throw new ApiError(401, "No authentication token provided. Please log in.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "setu_super_secret_jwt_key_sih2026_rural_health_access");
    const user = await User.findById(decoded?.id).select("-password");

    if (!user) {
      throw new ApiError(401, "User not found or token expired. Please log in again.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, error?.message || "Invalid authentication token.");
  }
});
