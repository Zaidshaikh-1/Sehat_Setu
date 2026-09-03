import { socketAuth } from "../middlewares/socketAuth.js";

let activeUsers = [];

export function initReferralSocket(io) {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, "User:", socket.user?.name, `[${socket.user?.role}]`);

    const userInfo = {
      socketId: socket.id,
      userId: socket.user?._id?.toString() || "guest",
      name: socket.user?.name || "Guest",
      role: socket.user?.role || "guest",
      village: socket.user?.village || "Rural Sub-District",
    };

    activeUsers.push(userInfo);
    io.emit("activeHealthcareWorkers", activeUsers);

    // Join facility specific room if available
    if (socket.user?.facility) {
      socket.join(`facility:${socket.user.facility.toString()}`);
    }

    // Handle real-time referral status broadcast
    socket.on("referralStatusChanged", (data) => {
      console.log("Referral status changed event broadcast:", data?.referralCode, "->", data?.newStatus);
      io.emit("referralUpdated", data);
    });

    // Handle emergency SOS broadcast
    socket.on("emergencySosTriggered", (data) => {
      console.log("EMERGENCY SOS ALERT TRIGGERED:", data?.patientName, data?.location);
      io.emit("emergencyAlert", {
        ...data,
        timestamp: new Date(),
        broadcastBy: socket.user?.name,
      });
    });

    socket.on("disconnect", () => {
      activeUsers = activeUsers.filter((u) => u.socketId !== socket.id);
      io.emit("activeHealthcareWorkers", activeUsers);
      console.log("Socket disconnected:", socket.id);
    });
  });
}
