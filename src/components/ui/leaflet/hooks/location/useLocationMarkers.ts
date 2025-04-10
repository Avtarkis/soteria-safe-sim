
import { useRef, useCallback } from 'react';
import L from 'leaflet';

/**
 * Hook to manage user location markers (dot and accuracy circle)
 */
export function useLocationMarkers(map: L.Map | null) {
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);
  
  // Function to safely remove a map layer
  const safelyRemoveLayer = useCallback((layer: L.Layer | null) => {
    if (!layer || !map) return null;
    
    try {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    } catch (error) {
      console.error("Error removing layer:", error);
    }
    return null;
  }, [map]);
  
  // Function to clean up all location layers
  const cleanupMarkers = useCallback(() => {
    if (!map) return;
    
    try {
      userLocationMarkerRef.current = safelyRemoveLayer(userLocationMarkerRef.current);
      userLocationCircleRef.current = safelyRemoveLayer(userLocationCircleRef.current);
    } catch (error) {
      console.error("Error in location markers cleanup:", error);
    }
  }, [map, safelyRemoveLayer]);
  
  const createOrUpdateMarkers = useCallback((lat: number, lng: number, accuracy: number) => {
    if (!map) return;
    
    try {
      // Create location marker if it doesn't exist
      if (!userLocationMarkerRef.current) {
        userLocationMarkerRef.current = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div class="pulse"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(map);
      } else {
        userLocationMarkerRef.current.setLatLng([lat, lng]);
      }
      
      // Create accuracy circle if it doesn't exist
      if (!userLocationCircleRef.current) {
        userLocationCircleRef.current = L.circle([lat, lng], {
          radius: accuracy,
          color: '#4a80f5',
          fillColor: '#4a80f580',
          fillOpacity: 0.2,
          weight: 1
        }).addTo(map);
      } else {
        userLocationCircleRef.current.setLatLng([lat, lng]);
        userLocationCircleRef.current.setRadius(accuracy);
      }
    } catch (error) {
      console.error("Error creating/updating location markers:", error);
    }
  }, [map]);
  
  return {
    createOrUpdateMarkers,
    cleanupMarkers,
    markerRefs: { userLocationMarkerRef, userLocationCircleRef }
  };
}

export default useLocationMarkers;
