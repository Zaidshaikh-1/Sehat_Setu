import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDb } from "./db/db.connection.js";
import { initReferralSocket } from "./socket/referral.socket.js";
import { initAmbulanceSocket } from "./socket/ambulance.socket.js";
import { setIo } from "./socket/io.store.js";

const PORT = process.env.PORT || 5050;

connectDb()
  .then(() => {
    const server = createServer(app);

    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => callback(null, true),
        credentials: true,
        methods: ["GET", "POST", "PATCH"],
      },
    });

    app.set("io", io);
    setIo(io);

    initReferralSocket(io);
    initAmbulanceSocket(io);

    server.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(` SETU HEALTHCARE SERVER RUNNING`);
      console.log(` Port: ${PORT}`);
      console.log(` Mode: ${process.env.NODE_ENV || "development"}`);
      console.log(` ABDM Interoperability Mock: READY`);
      console.log(`=========================================`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
