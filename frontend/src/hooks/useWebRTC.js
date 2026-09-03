import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "../utils/socket.js";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export function useWebRTC({ roomId, userName = "User", userRole = "doctor", autoStart = true }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [callStatus, setCallStatus] = useState("idle"); // idle, connecting, in-call, ended

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const remoteSocketIdRef = useRef(null);

  // Initialize Local Media Stream
  const initLocalStream = useCallback(async (withVideo = true) => {
    try {
      if (localStreamRef.current) {
        return localStreamRef.current;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: withVideo ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } : false,
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.warn("Could not get audio+video stream, trying audio only:", err);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        localStreamRef.current = audioStream;
        setLocalStream(audioStream);
        return audioStream;
      } catch (audioErr) {
        console.error("Microphone and camera access denied or unavailable:", audioErr);
        return null;
      }
    }
  }, []);

  // Create Peer Connection
  const createPeerConnection = useCallback((targetSocketId) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;
    remoteSocketIdRef.current = targetSocketId;

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log("[WebRTC] Received remote track:", event.track.kind);
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        setRemoteStream(event.streams[0]);
      } else {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        remoteStreamRef.current.addTrack(event.track);
        setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
      }
      setIsConnected(true);
      setCallStatus("in-call");
    };

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        socket.emit("call:ice-candidate", {
          targetSocketId,
          candidate: event.candidate,
          roomId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[WebRTC] Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setIsConnected(true);
        setCallStatus("in-call");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
        setIsConnected(false);
        if (pc.connectionState === "closed") {
          setRemoteStream(null);
        }
      }
    };

    return pc;
  }, [roomId]);

  // Initiate call by sending SDP offer to peer
  const sendOffer = useCallback(async (targetSocketId) => {
    try {
      const pc = createPeerConnection(targetSocketId);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      socket.emit("call:offer", {
        targetSocketId,
        offer,
        roomId,
      });
      setCallStatus("connecting");
    } catch (err) {
      console.error("[WebRTC] Failed to send offer:", err);
    }
  }, [createPeerConnection, roomId]);

  // Start / Join Room
  const startCall = useCallback(async () => {
    if (!roomId) return;
    setCallStatus("connecting");
    setIsCallActive(true);

    await initLocalStream(!isVideoMuted);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("call:join", {
      roomId,
      userName,
      userRole,
    });
  }, [roomId, userName, userRole, isVideoMuted, initLocalStream]);

  // Toggle Audio Mute
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks.forEach((t) => (t.enabled = nextState));
        setIsAudioMuted(!nextState);
      }
    }
  }, []);

  // Toggle Video Mute
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks.forEach((t) => (t.enabled = nextState));
        setIsVideoMuted(!nextState);
      }
    }
  }, []);

  // End Call
  const endCall = useCallback(() => {
    if (roomId) {
      socket.emit("call:leave", { roomId });
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    setRemoteStream(null);
    setIsConnected(false);
    setIsCallActive(false);
    setCallStatus("ended");
    setRemoteUser(null);
  }, [roomId]);

  // Setup Socket Listeners
  useEffect(() => {
    if (!roomId) return;

    if (autoStart) {
      startCall();
    }

    // Ready event: response to join with existing participants
    const handleReady = async ({ participants }) => {
      console.log("[WebRTC] Call ready. Existing participants:", participants);
      if (participants && participants.length > 0) {
        const peer = participants[0];
        setRemoteUser(peer);
        // If someone is already in the room, send them an offer
        await sendOffer(peer.socketId);
      }
    };

    // User joined: when another peer enters our room
    const handleUserJoined = async ({ socketId, userName: name, userRole: role }) => {
      console.log("[WebRTC] Peer joined room:", name, role, socketId);
      setRemoteUser({ socketId, userName: name, userRole: role });
    };

    // Offer received: set remote description and reply with answer
    const handleOffer = async ({ fromSocketId, offer, userName: name, userRole: role }) => {
      console.log("[WebRTC] Received offer from:", name, fromSocketId);
      setRemoteUser({ socketId: fromSocketId, userName: name, userRole: role });

      try {
        if (!localStreamRef.current) {
          await initLocalStream();
        }
        const pc = createPeerConnection(fromSocketId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("call:answer", {
          targetSocketId: fromSocketId,
          answer,
          roomId,
        });
        setCallStatus("in-call");
      } catch (err) {
        console.error("[WebRTC] Error handling offer:", err);
      }
    };

    // Answer received: complete handshake
    const handleAnswer = async ({ answer }) => {
      console.log("[WebRTC] Received answer");
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error("[WebRTC] Error setting remote answer:", err);
      }
    };

    // ICE candidate received: add candidate
    const handleIceCandidate = async ({ candidate }) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("[WebRTC] Error adding ICE candidate:", err);
      }
    };

    // User left
    const handleUserLeft = ({ userName: name }) => {
      console.log("[WebRTC] Peer left:", name);
      setRemoteStream(null);
      setIsConnected(false);
      setRemoteUser(null);
      setCallStatus("waiting-for-peer");
    };

    socket.on("call:ready", handleReady);
    socket.on("call:user-joined", handleUserJoined);
    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIceCandidate);
    socket.on("call:user-left", handleUserLeft);

    return () => {
      socket.off("call:ready", handleReady);
      socket.off("call:user-joined", handleUserJoined);
      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIceCandidate);
      socket.off("call:user-left", handleUserLeft);
      endCall();
    };
  }, [roomId, autoStart]);

  return {
    localStream,
    remoteStream,
    isConnected,
    isCallActive,
    isAudioMuted,
    isVideoMuted,
    remoteUser,
    callStatus,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };
}
