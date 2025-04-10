
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { createPulsingIcon } from '../UserLocationMarker';

interface LocationMarkerProps {
  map: L.Map | null;
  userLocation: [number, number] | null;
  accuracy: number;
  safetyLevel: 'safe' | 'caution' | 'danger';
}

/**
 * Component that renders the user's location marker on the map
 */
const LocationMarker = ({
  map,
  userLocation,
  accuracy,
  safetyLevel
}: LocationMarkerProps) => {
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const previousLocationRef = useRef<string | null>(null);
  
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
      console.log(`Updating user location: ${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}, safety: ${safetyLevel}`);
      const latlng = L.latLng(userLocation[0], userLocation[1]);
      
      // Create pulsing icon based on safety level
      const pulsingIcon = createPulsingIcon(safetyLevel);
      
      // Add user marker with pulsing icon and ensure it's visible
      userMarkerRef.current = L.marker(latlng, { 
        icon: pulsingIcon, 
        zIndexOffset: 1000, // Ensure marker is on top
        interactive: true, // Make marker clickable
      })
        .addTo(map)
        .bindPopup(`
          <b>Your Exact Location</b><br>
          Lat: ${latlng.lat.toFixed(5)}<br>
          Lng: ${latlng.lng.toFixed(5)}<br>
          Accuracy: ±${accuracy < 1 ? accuracy.toFixed(2) : accuracy.toFixed(1)} meters
        `);
      
      // Make sure marker is visible by bringing it to front
      if (userMarkerRef.current) {
        userMarkerRef.current.getElement()?.classList.add('user-marker-pin');
        // Explicitly set z-index to ensure visibility
        if (userMarkerRef.current.getElement()) {
          userMarkerRef.current.getElement()!.style.zIndex = '1000';
        }
      }
      
      // Color the accuracy circle based on safety level
      const circleColor = safetyLevel === 'safe' ? '#4F46E5' : 
                          safetyLevel === 'caution' ? '#F59E0B' : '#EF4444';
      
      // Add accuracy circle
      accuracyCircleRef.current = L.circle(latlng, {
        radius: Math.max(10, accuracy), // Ensure at least 10m radius for visibility
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.1,
        weight: 2,
        zIndexOffset: 999,
      }).addTo(map);
      
      // Log for debugging
      console.log(`Created user location marker at ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
      
    } catch (error) {
      console.error("Error creating user location markers:", error);
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

export default LocationMarker;
