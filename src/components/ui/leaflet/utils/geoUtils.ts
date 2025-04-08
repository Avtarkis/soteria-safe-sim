
/**
 * Calculates distance between two coordinates in meters using Haversine formula
 */
export const calculateDistanceInMeters = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in meters
};

/**
 * Determines appropriate zoom level based on location accuracy
 */
export const getZoomLevelForAccuracy = (accuracy: number): number => {
  if (accuracy < 10) return 19;
  if (accuracy < 30) return 18;
  if (accuracy < 100) return 17;
  if (accuracy < 500) return 16;
  if (accuracy < 2000) return 15;
  return 14;
};
