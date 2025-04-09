
import { useEffect, useRef, useState } from 'react';
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
  const previousLocationRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Update user location marker when it changes, with debouncing and error handling
  useEffect(() => {
    if (!map || !userLocation) {
      // Clean up existing markers if location is not available
      const cleanup = () => {
        if (userMarkerRef.current) {
          try {
            if (map && map.hasLayer(userMarkerRef.current)) {
              map.removeLayer(userMarkerRef.current);
            }
            userMarkerRef.current = null;
          } catch (error) {
            console.error("Error removing user marker:", error);
            userMarkerRef.current = null;
          }
        }
        if (accuracyCircleRef.current) {
          try {
            if (map && map.hasLayer(accuracyCircleRef.current)) {
              map.removeLayer(accuracyCircleRef.current);
            }
            accuracyCircleRef.current = null;
          } catch (error) {
            console.error("Error removing accuracy circle:", error);
            accuracyCircleRef.current = null;
          }
        }
      };
      
      cleanup();
      return;
    }
    
    // Check if the map is ready for adding elements
    if (!map.getContainer() || map.getContainer().clientHeight === 0) {
      console.warn("Map container not ready for user location layer");
      return;
    }
    
    // Debounce location updates by checking if the location has changed
    const locationKey = `${userLocation[0].toFixed(6)}-${userLocation[1].toFixed(6)}-${accuracy.toFixed(1)}-${safetyLevel}`;
    if (locationKey === previousLocationRef.current) {
      console.log("Location unchanged, skipping update");
      return;
    }
    
    previousLocationRef.current = locationKey;
    
    // Remove existing markers if present
    if (userMarkerRef.current) {
      try {
        if (map.hasLayer(userMarkerRef.current)) {
          map.removeLayer(userMarkerRef.current);
        }
        userMarkerRef.current = null;
      } catch (error) {
        console.error("Error removing user marker:", error);
        userMarkerRef.current = null;
      }
    }
    if (accuracyCircleRef.current) {
      try {
        if (map.hasLayer(accuracyCircleRef.current)) {
          map.removeLayer(accuracyCircleRef.current);
        }
        accuracyCircleRef.current = null;
      } catch (error) {
        console.error("Error removing accuracy circle:", error);
        accuracyCircleRef.current = null;
      }
    }
    
    // Only proceed if map is still valid
    if (!map.getContainer() || map.getContainer().clientHeight === 0) {
      console.warn("Map container not ready for updating user location");
      return;
    }
    
    try {
      console.log(`Updating user location: ${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}`);
      const latlng = L.latLng(userLocation[0], userLocation[1]);
      
      // Create pulsing icon based on safety level
      const pulsingIcon = createPulsingIcon(safetyLevel);
      
      // Add user marker
      userMarkerRef.current = L.marker(latlng, { icon: pulsingIcon, zIndexOffset: 1000 })
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
      
      setError(null);
    } catch (error) {
      console.error("Error creating user location markers:", error);
      setError("Failed to update user location");
    }
    
    // Cleanup when component unmounts
    return () => {
      if (map) {
        if (userMarkerRef.current) {
          try {
            if (map.hasLayer(userMarkerRef.current)) {
              map.removeLayer(userMarkerRef.current);
            }
            userMarkerRef.current = null;
          } catch (error) {
            console.error("Error unmounting user marker:", error);
            userMarkerRef.current = null;
          }
        }
        if (accuracyCircleRef.current) {
          try {
            if (map.hasLayer(accuracyCircleRef.current)) {
              map.removeLayer(accuracyCircleRef.current);
            }
            accuracyCircleRef.current = null;
          } catch (error) {
            console.error("Error unmounting accuracy circle:", error);
            accuracyCircleRef.current = null;
          }
        }
      }
    };
  }, [map, userLocation, accuracy, safetyLevel]);
  
  return null; // This is a non-visual component
};

export default UserLocationLayer;
