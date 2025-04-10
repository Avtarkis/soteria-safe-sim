
import { useCallback } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';
import { LocationRefType } from './useLocationRefs';
import { createPulsingIcon, determineSafetyLevel } from '../../UserLocationMarker';

/**
 * Hook to manage location markers on the map
 */
export function useLocationMarkers(
  map: L.Map | null,
  locationRefs: LocationRefType,
  threatMarkers: ThreatMarker[]
) {
  const {
    userLocationMarkerRef,
    userLocationCircleRef,
    userLocationLatLngRef,
    userLocationAccuracyRef,
    safetyLevelRef,
    lastEventTimeRef
  } = locationRefs;
  
  // Update location markers on the map
  const updateLocationMarkers = useCallback((lat: number, lng: number, accuracy: number) => {
    if (!map) return;
    
    try {
      // Throttle updates (no more than once per second)
      const now = Date.now();
      if (now - lastEventTimeRef.current < 1000) {
        return;
      }
      lastEventTimeRef.current = now;
      
      console.log(`Updating location: ${lat.toFixed(6)}, ${lng.toFixed(6)}, accuracy: ${accuracy.toFixed(1)}m`);
      
      // Update refs with new location
      userLocationLatLngRef.current = L.latLng(lat, lng);
      userLocationAccuracyRef.current = accuracy;
      
      // Determine safety level based on proximity to threats
      safetyLevelRef.current = determineSafetyLevel([lat, lng], threatMarkers);
      
      // Remove existing markers
      removeExistingMarkers();
      
      // Create new markers
      createMarkers(lat, lng, accuracy, safetyLevelRef.current);
    } catch (error) {
      console.error("Error updating location markers:", error);
    }
  }, [map, locationRefs, threatMarkers, lastEventTimeRef, userLocationLatLngRef, 
      userLocationAccuracyRef, safetyLevelRef, userLocationMarkerRef, userLocationCircleRef]);
  
  // Remove existing markers
  const removeExistingMarkers = useCallback(() => {
    if (!map) return;
    
    try {
      if (userLocationMarkerRef.current) {
        map.removeLayer(userLocationMarkerRef.current);
        userLocationMarkerRef.current = null;
      }
      
      if (userLocationCircleRef.current) {
        map.removeLayer(userLocationCircleRef.current);
        userLocationCircleRef.current = null;
      }
    } catch (error) {
      console.error("Error removing markers:", error);
    }
  }, [map, userLocationMarkerRef, userLocationCircleRef]);
  
  // Create new markers
  const createMarkers = useCallback((lat: number, lng: number, accuracy: number, safetyLevel: 'safe' | 'caution' | 'danger') => {
    if (!map) return;
    
    try {
      const latlng = L.latLng(lat, lng);
      
      // Create pulsing icon based on safety level
      const pulsingIcon = createPulsingIcon(safetyLevel);
      
      // Add user marker with pulsing icon
      userLocationMarkerRef.current = L.marker(latlng, { 
        icon: pulsingIcon,
        zIndexOffset: 1000,
        interactive: true,
        bubblingMouseEvents: false
      })
        .addTo(map)
        .bindPopup(`
          <b>Your Exact Location</b><br>
          Lat: ${lat.toFixed(5)}<br>
          Lng: ${lng.toFixed(5)}<br>
          Accuracy: ±${accuracy < 1 ? accuracy.toFixed(2) : accuracy.toFixed(1)} meters
        `);
      
      // Make sure marker is visible
      if (userLocationMarkerRef.current && userLocationMarkerRef.current.getElement()) {
        userLocationMarkerRef.current.getElement()!.classList.add('user-marker-pin');
        userLocationMarkerRef.current.getElement()!.style.zIndex = '10000';
        userLocationMarkerRef.current.setZIndexOffset(10000);
      }
      
      // Color the accuracy circle based on safety level
      const circleColor = safetyLevel === 'safe' ? '#4F46E5' : 
                         safetyLevel === 'caution' ? '#F59E0B' : '#EF4444';
      
      // Add accuracy circle
      userLocationCircleRef.current = L.circle(latlng, {
        radius: Math.max(10, accuracy),
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.1,
        weight: 2
      }).addTo(map);
    } catch (error) {
      console.error("Error creating markers:", error);
    }
  }, [map, userLocationMarkerRef, userLocationCircleRef]);
  
  return {
    updateLocationMarkers,
    removeExistingMarkers
  };
}

export default useLocationMarkers;
