
import L from 'leaflet';

// Create a pulsing icon for user location that indicates safety level
export const createPulsingIcon = (safetyLevel: 'safe' | 'caution' | 'danger' = 'safe') => {
  // Define colors based on safety level
  const colors = {
    safe: {
      main: '#4F46E5', // Indigo
      pulse: 'rgba(79, 70, 229, 0.4)'
    },
    caution: {
      main: '#F59E0B', // Amber
      pulse: 'rgba(245, 158, 11, 0.4)'
    },
    danger: {
      main: '#EF4444', // Red
      pulse: 'rgba(239, 68, 68, 0.4)'
    }
  };
  
  const { main, pulse } = colors[safetyLevel];
  
  // Create a custom marker icon with CSS animation
  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="marker-pin" style="position: relative;">
        <div class="user-marker-outer" style="
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: ${pulse};
          opacity: 0.8;
          animation: pulse 2s infinite;
          top: -15px;
          left: -15px;
          z-index: 1;
        "></div>
        <div class="user-marker-inner" style="
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${main};
          border: 2px solid white;
          top: -6px;
          left: -6px;
          z-index: 2;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          70% {
            transform: scale(2);
            opacity: 0.3;
          }
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }
      </style>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
  
  return icon;
};

// Export function to determine safety level based on nearby threats
export const determineSafetyLevel = (
  userLocation: [number, number], 
  threats: any[] = []
): 'safe' | 'caution' | 'danger' => {
  if (!userLocation || threats.length === 0) return 'safe';
  
  // Calculate distances to nearby threats
  const nearbyThreats = threats.filter(threat => {
    // Skip if threat doesn't have position
    if (!threat.position) return false;
    
    // Calculate rough distance in meters
    const distance = calculateDistanceInMeters(
      userLocation[0], userLocation[1],
      threat.position[0], threat.position[1]
    );
    
    // Consider threats within 2km
    return distance < 2000;
  });
  
  // Count threats by severity
  const highLevelThreats = nearbyThreats.filter(t => t.level === 'high').length;
  const mediumLevelThreats = nearbyThreats.filter(t => t.level === 'medium').length;
  
  // Determine safety level
  if (highLevelThreats > 0) return 'danger';
  if (mediumLevelThreats > 0) return 'caution';
  return 'safe';
};

// Helper to calculate distance between coordinates
const calculateDistanceInMeters = (
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

export default createPulsingIcon;
