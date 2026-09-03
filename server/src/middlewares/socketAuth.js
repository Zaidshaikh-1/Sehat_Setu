import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      // Allow fallback guest connection for unauthenticated real-time dashboard listeners
      socket.user = { name: "Observer", role: "guest" };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "setu_super_secret_jwt_key_sih2026_rural_health_access");
    const user = await User.findById(decoded?.id).select("-password");

    if (user) {
      socket.user = user;
    } else {
      socket.user = { name: "Anonymous", role: "guest" };
    }

    next();
  } catch (error) {
    socket.user = { name: "Observer", role: "guest" };
    next();
  }
};
