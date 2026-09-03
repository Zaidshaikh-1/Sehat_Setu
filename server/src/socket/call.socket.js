// WebRTC Signaling Handler via Socket.IO for Video & Voice Calls

const activeCallRooms = new Map(); // roomId -> Set of socketIds

export const initCallSocket = (io) => {
  io.on("connection", (socket) => {
    // 1. Join Room
    socket.on("call:join", ({ roomId, userRole, userName }) => {
      if (!roomId) return;

      socket.join(`call_${roomId}`);

      if (!activeCallRooms.has(roomId)) {
        activeCallRooms.set(roomId, new Set());
      }
      const roomSockets = activeCallRooms.get(roomId);
      roomSockets.add(socket.id);

      socket.data = { roomId, userRole: userRole || "participant", userName: userName || "Anonymous" };

      console.log(`[Call Socket] ${socket.id} (${socket.data.userName}, ${socket.data.userRole}) joined room: ${roomId}. Total: ${roomSockets.size}`);

      // Notify others in room that a user joined
      socket.to(`call_${roomId}`).emit("call:user-joined", {
        socketId: socket.id,
        userRole: socket.data.userRole,
        userName: socket.data.userName,
        participantsCount: roomSockets.size,
      });

      // Send list of other participants back to the new joiner
      const otherParticipants = Array.from(roomSockets)
        .filter((id) => id !== socket.id)
        .map((id) => {
          const s = io.sockets.sockets.get(id);
          return {
            socketId: id,
            userRole: s?.data?.userRole || "participant",
            userName: s?.data?.userName || "Anonymous",
          };
        });

      socket.emit("call:ready", {
        roomId,
        participants: otherParticipants,
        participantsCount: roomSockets.size,
      });
    });

    // 2. WebRTC SDP Offer
    socket.on("call:offer", ({ targetSocketId, offer, roomId }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:offer", {
          fromSocketId: socket.id,
          offer,
          userName: socket.data?.userName,
          userRole: socket.data?.userRole,
        });
      } else if (roomId) {
        socket.to(`call_${roomId}`).emit("call:offer", {
          fromSocketId: socket.id,
          offer,
          userName: socket.data?.userName,
          userRole: socket.data?.userRole,
        });
      }
    });

    // 3. WebRTC SDP Answer
    socket.on("call:answer", ({ targetSocketId, answer, roomId }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:answer", {
          fromSocketId: socket.id,
          answer,
        });
      } else if (roomId) {
        socket.to(`call_${roomId}`).emit("call:answer", {
          fromSocketId: socket.id,
          answer,
        });
      }
    });

    // 4. Relay ICE Candidates
    socket.on("call:ice-candidate", ({ targetSocketId, candidate, roomId }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:ice-candidate", {
          fromSocketId: socket.id,
          candidate,
        });
      } else if (roomId) {
        socket.to(`call_${roomId}`).emit("call:ice-candidate", {
          fromSocketId: socket.id,
          candidate,
        });
      }
    });

    // 5. Explicit Leave
    socket.on("call:leave", ({ roomId }) => {
      handleLeave(socket, roomId, io);
    });

    // 6. Disconnect handling
    socket.on("disconnect", () => {
      const roomId = socket.data?.roomId;
      if (roomId) {
        handleLeave(socket, roomId, io);
      }
    });
  });
};

function handleLeave(socket, roomId, io) {
  if (!roomId || !activeCallRooms.has(roomId)) return;

  const roomSockets = activeCallRooms.get(roomId);
  roomSockets.delete(socket.id);

  socket.leave(`call_${roomId}`);

  socket.to(`call_${roomId}`).emit("call:user-left", {
    socketId: socket.id,
    userName: socket.data?.userName,
    userRole: socket.data?.userRole,
    participantsCount: roomSockets.size,
  });

  console.log(`[Call Socket] ${socket.id} left room ${roomId}. Remaining: ${roomSockets.size}`);

  if (roomSockets.size === 0) {
    activeCallRooms.delete(roomId);
  }
}
