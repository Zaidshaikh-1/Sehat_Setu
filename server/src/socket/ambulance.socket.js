// Live Ambulance Telemetry & Route Simulation via Socket.IO

const activeSimulations = new Map();

export const initAmbulanceSocket = (io) => {
  io.on("connection", (socket) => {
    // Client subscribes to a specific ambulance stream
    socket.on("ambulance:subscribe", ({ sosCode }) => {
      if (!sosCode) return;
      socket.join(`ambulance_${sosCode}`);

      // If already active, immediately send current state
      if (activeSimulations.has(sosCode)) {
        const state = activeSimulations.get(sosCode);
        socket.emit("ambulance:position", state.current);
      }
    });

    // Client or SOS trigger starts a new tracking simulation
    socket.on("ambulance:start", (payload) => {
      startSimulation(io, payload);
    });
  });
};

export const startSimulation = (io, payload) => {
  const {
    sosCode = `SOS-108-${Date.now()}`,
    driverName = "Sanjay Shinde",
    driverPhone = "+91 98229 10801",
    vehicleNumber = "MH-12-EM-1081",
    hospitalCoords = { lat: 18.56, lng: 73.80 },
    patientCoords = { lat: 18.7512, lng: 73.4021 },
    routeWaypoints = [],
    etaMinutes = 12,
    distanceKm = 8.4,
  } = payload;

  // Clear existing timer if any
  if (activeSimulations.has(sosCode)) {
    const existing = activeSimulations.get(sosCode);
    if (existing.intervalId) clearInterval(existing.intervalId);
  }

  // Generate waypoints if not provided
  const waypoints =
    routeWaypoints.length > 0
      ? routeWaypoints
      : generateDefaultWaypoints(hospitalCoords, patientCoords, 25);

  let currentStep = 0;
  const totalSteps = waypoints.length - 1;
  const stepIntervalMs = 2000; // 2 seconds per tick

  const simulationState = {
    sosCode,
    driverName,
    driverPhone,
    vehicleNumber,
    hospitalCoords,
    patientCoords,
    waypoints,
    current: {
      sosCode,
      driverName,
      driverPhone,
      vehicleNumber,
      hospitalCoords,
      patientCoords,
      waypoints,
      lat: waypoints[0][0],
      lng: waypoints[0][1],
      progress: 0,
      step: 0,
      totalSteps,
      status: "dispatched",
      speedKmh: 45,
      distanceRemainingKm: distanceKm,
      etaSeconds: etaMinutes * 60,
      timestamp: new Date(),
    },
    intervalId: null,
  };

  const intervalId = setInterval(() => {
    currentStep++;
    const progress = Math.min(1, currentStep / totalSteps);
    const [lat, lng] = waypoints[Math.min(currentStep, totalSteps)];

    let status = "dispatched";
    if (progress > 0.85) {
      status = "arrived";
    } else if (progress > 0.65) {
      status = "arriving";
    } else if (progress > 0.05) {
      status = "en-route";
    }

    const distanceRemainingKm = Math.max(0, parseFloat((distanceKm * (1 - progress)).toFixed(1)));
    const etaSeconds = Math.max(0, Math.round(etaMinutes * 60 * (1 - progress)));
    const speedKmh = progress >= 1 ? 0 : Math.floor(40 + Math.random() * 20);

    const update = {
      sosCode,
      driverName,
      driverPhone,
      vehicleNumber,
      hospitalCoords,
      patientCoords,
      waypoints,
      lat,
      lng,
      progress: parseFloat(progress.toFixed(3)),
      step: currentStep,
      totalSteps,
      status,
      speedKmh,
      distanceRemainingKm,
      etaSeconds,
      timestamp: new Date(),
    };

    simulationState.current = update;
    activeSimulations.set(sosCode, simulationState);

    // Emit to subscribed room & broadcast globally
    io.to(`ambulance_${sosCode}`).emit("ambulance:position", update);
    io.emit("ambulance:position", update);

    if (progress >= 1) {
      clearInterval(intervalId);
      io.to(`ambulance_${sosCode}`).emit("ambulance:arrived", {
        sosCode,
        message: "Ambulance 108 has arrived at the patient location.",
        arrivedAt: new Date(),
      });
      io.emit("ambulance:arrived", {
        sosCode,
        message: "Ambulance 108 has arrived at the patient location.",
        arrivedAt: new Date(),
      });
    }
  }, stepIntervalMs);

  simulationState.intervalId = intervalId;
  activeSimulations.set(sosCode, simulationState);

  // Emit immediate first position
  io.to(`ambulance_${sosCode}`).emit("ambulance:position", simulationState.current);
  io.emit("ambulance:position", simulationState.current);
};

function generateDefaultWaypoints(start, end, count = 20) {
  const pts = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const jitterLat = Math.sin(t * Math.PI) * 0.008;
    const jitterLng = Math.sin(t * Math.PI * 2) * 0.006;
    pts.push([start.lat + (end.lat - start.lat) * t + jitterLat, start.lng + (end.lng - start.lng) * t + jitterLng]);
  }
  return pts;
}
