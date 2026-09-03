// High-density realistic road coordinates following rural district roads and state highways (Rampur -> Khandala -> NH48 -> Aundh DH)
export const REALISTIC_ROAD_WAYPOINTS = [
  [18.7312, 73.3820], // 0: Rampur Sub-Centre Clinic Gate
  [18.7328, 73.3845], // 1: Rampur Village Gram Panchayat Chowk
  [18.7345, 73.3872], // 2: Rampur East Canal Road
  [18.7360, 73.3905], // 3: Rural Link Road Turn
  [18.7382, 73.3938], // 4: Maval Feeder Road
  [18.7410, 73.3965], // 5: Khandala Approach Road
  [18.7442, 73.3988], // 6: Khandala Sub-Centre junction
  [18.7478, 73.4005], // 7: Khandala PHC Hub Turn
  [18.7512, 73.4021], // 8: Old Highway Junction (Khandala)
  [18.7495, 73.4120], // 9: NH-48 Southbound Entry
  [18.7470, 73.4245], // 10: Kamshet Valley Curve
  [18.7435, 73.4380], // 11: Indrayani River Bridge approach
  [18.7390, 73.4520], // 12: Highway straight stretch
  [18.7340, 73.4680], // 13: Vadgaon Maval Toll bypass
  [18.7285, 73.4850], // 14: Vadgaon interchange curve
  [18.7220, 73.5040], // 15: Kanhe Industrial bypass
  [18.7145, 73.5250], // 16: Highway smooth curve
  [18.7060, 73.5480], // 17: Talegaon Dabhade Outer Ring
  [18.6970, 73.5720], // 18: Talegaon Lake bend
  [18.6875, 73.5980], // 19: NH-48 Express Link
  [18.6770, 73.6250], // 20: Somatane Phata interchange
  [18.6655, 73.6530], // 21: Dehu Road cantonment corridor
  [18.6530, 73.6820], // 22: Kiwale expressway merge
  [18.6410, 73.7080], // 23: Ravet flyover incline
  [18.6290, 73.7310], // 24: Bhakti-Shakti Chowk, Nigdi
  [18.6185, 73.7480], // 25: Old Mumbai-Pune arterial stretch
  [18.6090, 73.7620], // 26: Akurdi Railway station bend
  [18.5995, 73.7740], // 27: Chinchwad Station Flyover
  [18.5910, 73.7840], // 28: Pimpri Grade Separator
  [18.5830, 73.7915], // 29: Vallabh Nagar ST Stand
  [18.5750, 73.7960], // 30: Kasarwadi Railway flyover
  [18.5685, 73.7990], // 31: Dapodi Harris Bridge over Mula River
  [18.5645, 73.8005], // 32: Aundh-Ravet BRTS corridor entry
  [18.5628, 73.8010], // 33: Aundh District Hospital Gate
  [18.5615, 73.8012], // 34: Emergency Trauma Bay & 108 Dispatch Center
];

// Helper: Calculate bearing/angle between two GPS points in degrees
export function calculateBearing(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);

  let brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

// Helper: Interpolate exact point along polyline at fractional progress (0.0 to 1.0)
export function getInterpolatedPoint(waypoints, progress) {
  if (!waypoints || waypoints.length === 0) return { lat: 18.7312, lng: 73.382, bearing: 0, index: 0 };
  if (progress <= 0) return { lat: waypoints[0][0], lng: waypoints[0][1], bearing: 0, index: 0 };
  if (progress >= 1) {
    const last = waypoints[waypoints.length - 1];
    const prev = waypoints[waypoints.length - 2] || last;
    const bearing = calculateBearing(prev[0], prev[1], last[0], last[1]);
    return { lat: last[0], lng: last[1], bearing, index: waypoints.length - 1 };
  }

  const totalSegments = waypoints.length - 1;
  const globalPosition = progress * totalSegments;
  const segmentIndex = Math.floor(globalPosition);
  const segmentFraction = globalPosition - segmentIndex;

  const p1 = waypoints[segmentIndex];
  const p2 = waypoints[Math.min(segmentIndex + 1, waypoints.length - 1)];

  const lat = p1[0] + (p2[0] - p1[0]) * segmentFraction;
  const lng = p1[1] + (p2[1] - p1[1]) * segmentFraction;
  const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

  return { lat, lng, bearing, index: segmentIndex };
}
