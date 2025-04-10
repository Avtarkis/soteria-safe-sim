
import L from 'leaflet';
import { determineSafetyLevel } from './utils/safetyAssessment';

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
    className: 'user-marker-pin',
    html: `
      <div class="marker-pin" style="position: relative; z-index: 1000;">
        <div class="user-marker-outer" style="
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: ${pulse};
          opacity: 0.8;
          top: -15px;
          left: -15px;
          z-index: 998;
          pointer-events: none;
          animation: pulse 2s infinite;
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
          z-index: 999;
          pointer-events: none;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
  
  return icon;
};

// Export the determineSafetyLevel function for use in other components
export { determineSafetyLevel };

export default createPulsingIcon;
