
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

// Export the determineSafetyLevel function for use in other components
export { determineSafetyLevel };

export default createPulsingIcon;
