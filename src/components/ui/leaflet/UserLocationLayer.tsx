
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { createPulsingIcon } from './UserLocationMarker';

interface UserLocationLayerProps {
  map: L.Map | null;
  userLocation: [number, number] | null;
  accuracy: number;
  safetyLevel: 'safe' | 'caution' | 'danger';
}

const UserLocationLayer = ({
  map,
  userLocation,
  accuracy,
  safetyLevel
}: UserLocationLayerProps) => {
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  
  // Update user location marker when it changes
  useEffect(() => {
    if (!map || !userLocation) {
      // Clean up existing markers if location is not available
      if (userMarkerRef.current) {
        map?.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (accuracyCircleRef.current) {
        map?.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }
      return;
    }
    
    // Remove existing markers if present
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current);
      accuracyCircleRef.current = null;
    }
    
    try {
      const latlng = L.latLng(userLocation[0], userLocation[1]);
      
      // Create pulsing icon based on safety level
      const pulsingIcon = createPulsingIcon(safetyLevel);
      
      // Add user marker
      userMarkerRef.current = L.marker(latlng, { icon: pulsingIcon })
        .addTo(map)
        .bindPopup(`
          <b>Your Exact Location</b><br>
          Lat: ${latlng.lat.toFixed(5)}<br>
          Lng: ${latlng.lng.toFixed(5)}<br>
          Accuracy: ±${accuracy < 1 ? accuracy.toFixed(2) : accuracy.toFixed(1)} meters
        `);
      
      // Color the accuracy circle based on safety level
      const circleColor = safetyLevel === 'safe' ? '#4F46E5' : 
                        safetyLevel === 'caution' ? '#F59E0B' : '#EF4444';
      
      // Add accuracy circle
      accuracyCircleRef.current = L.circle(latlng, {
        radius: accuracy,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.1,
        weight: 2
      }).addTo(map);
    } catch (error) {
      console.error("Error creating user location markers:", error);
    }
    
    // Cleanup when component unmounts
    return () => {
      if (map) {
        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
          userMarkerRef.current = null;
        }
        if (accuracyCircleRef.current) {
          map.removeLayer(accuracyCircleRef.current);
          accuracyCircleRef.current = null;
        }
      }
    };
  }, [map, userLocation, accuracy, safetyLevel]);
  
  return null; // This is a non-visual component
};

export default UserLocationLayer;
