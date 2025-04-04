
import React, { useEffect } from 'react';
import L from 'leaflet';

interface UserLocationMarkerProps {
  map: L.Map;
  latlng: L.LatLng;
  accuracy: number;
}

export const createPulsingIcon = () => {
  // Create styles for the pulsing effect if they don't exist
  if (!document.getElementById('pulsing-marker-css')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'pulsing-marker-css';
    styleElement.textContent = `
      @keyframes pulse {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      .pulse-circle {
        animation: pulse 1.5s infinite ease-out;
      }
      .double-pulse-circle {
        position: absolute;
        top: 0;
        left: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(79, 70, 229, 0.3);
        z-index: 1;
      }
      .double-pulse-circle:nth-child(1) {
        animation: pulse 2s infinite ease-out;
      }
      .double-pulse-circle:nth-child(2) {
        animation: pulse 2s infinite ease-out 1s;
      }
      .location-dot {
        position: absolute;
        top: 12px;
        left: 12px;
        width: 16px;
        height: 16px;
        background-color: #4F46E5;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        z-index: 2;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Create an improved pulsing icon with double pulse animation
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        <div class="location-dot"></div>
        <div class="double-pulse-circle"></div>
        <div class="double-pulse-circle"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// Correctly implement React FC with null return
const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ map, latlng, accuracy }) => {
  useEffect(() => {
    // Create marker and circle when component mounts
    let marker: L.Marker | null = null;
    let circle: L.Circle | null = null;
    
    try {
      marker = L.marker(latlng, { icon: createPulsingIcon() })
        .addTo(map)
        .bindPopup(`
          <b>Your Exact Location</b><br>
          Lat: ${latlng.lat.toFixed(8)}<br>
          Lng: ${latlng.lng.toFixed(8)}<br>
          Accuracy: ±${accuracy < 1 ? accuracy.toFixed(2) : accuracy.toFixed(1)} meters
        `);

      // Add circle showing accuracy radius
      circle = L.circle(latlng, {
        radius: accuracy,
        color: '#4F46E5',
        fillColor: '#4F46E5',
        fillOpacity: 0.1,
        weight: 1
      }).addTo(map);
      
      // Clean up when component unmounts
      return () => {
        try {
          if (marker) map.removeLayer(marker);
          if (circle) map.removeLayer(circle);
        } catch (error) {
          console.error("Error cleaning up marker/circle:", error);
        }
      };
    } catch (error) {
      console.error("Error creating location marker:", error);
      return undefined;
    }
  }, [map, latlng, accuracy]);
  
  // Return null as this is a side-effect component
  return null;
};

export default UserLocationMarker;
