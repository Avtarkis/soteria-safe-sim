
import { useCallback } from 'react';
import L from 'leaflet';

/**
 * Hook to manage location markers
 */
export function useLocationMarkers(map: L.Map | null) {
  // References for tracking map objects
  let userMarker: L.Marker | null = null;
  let accuracyCircle: L.Circle | null = null;
  
  // Create or update markers for user location
  const createOrUpdateMarkers = useCallback((lat: number, lng: number, accuracy: number) => {
    if (!map) return;
    
    try {
      // Remove existing markers
      if (userMarker) {
        map.removeLayer(userMarker);
        userMarker = null;
      }
      if (accuracyCircle) {
        map.removeLayer(accuracyCircle);
        accuracyCircle = null;
      }
      
      // Create simple user marker
      const pulsingIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div class="user-marker-inner"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      
      userMarker = L.marker([lat, lng], { icon: pulsingIcon })
        .addTo(map)
        .bindPopup(`
          <b>Your Location</b><br>
          Accuracy: ±${accuracy.toFixed(1)} meters
        `);
      
      // Create accuracy circle
      accuracyCircle = L.circle([lat, lng], {
        radius: accuracy,
        color: '#4F46E5',
        fillColor: '#4F46E5',
        fillOpacity: 0.1,
        weight: 2
      }).addTo(map);
      
    } catch (error) {
      console.error("Error creating location markers:", error);
    }
  }, [map]);
  
  // Clean up markers
  const cleanupMarkers = useCallback(() => {
    if (!map) return;
    
    try {
      if (userMarker && map.hasLayer(userMarker)) {
        map.removeLayer(userMarker);
        userMarker = null;
      }
      
      if (accuracyCircle && map.hasLayer(accuracyCircle)) {
        map.removeLayer(accuracyCircle);
        accuracyCircle = null;
      }
    } catch (error) {
      console.error("Error cleaning up markers:", error);
    }
  }, [map]);
  
  return {
    createOrUpdateMarkers,
    cleanupMarkers
  };
}

export default useLocationMarkers;
