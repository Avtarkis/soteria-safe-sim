
import { useRef, useCallback } from 'react';
import L from 'leaflet';
import { useLocationMarkers } from './useLocationMarkers';
import { useLocationEvents } from './useLocationEvents';
import { ThreatMarker } from '@/types/threats';

interface LocationUpdaterProps {
  map: L.Map | null;
  threatMarkers: ThreatMarker[];
}

/**
 * Hook to handle location updates
 */
export function useLocationUpdater({ 
  map, 
  threatMarkers 
}: LocationUpdaterProps) {
  // References for tracking state
  const userLocationLatLngRef = useRef<L.LatLng | null>(null);
  const userLocationAccuracyRef = useRef<number>(0);
  const safetyLevelRef = useRef<'safe' | 'caution' | 'danger'>('safe');
  
  // Create dummy location refs since we don't have access to the actual refs from this hook
  const locationRefs = {
    userLocationMarkerRef: { current: null },
    userLocationCircleRef: { current: null },
    userLocationLatLngRef,
    userLocationAccuracyRef,
    safetyLevelRef,
    lastEventTimeRef: { current: 0 }
  };
  
  const { updateLocationMarkers, removeExistingMarkers } = useLocationMarkers(map, locationRefs, threatMarkers);
  const { getSafetyLevel } = useLocationEvents(threatMarkers);
  
  // Handle location update
  const handleLocationUpdate = useCallback((position: GeolocationPosition) => {
    if (!map) return;
    
    try {
      const { latitude, longitude, accuracy } = position.coords;
      
      // Skip extremely inaccurate locations (>10km)
      if (accuracy > 10000) {
        console.warn(`Skipping inaccurate location update: ${accuracy.toFixed(1)}m`);
        return;
      }
      
      console.log(`Location update: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, accuracy: ${accuracy.toFixed(1)}m`);
      
      // Update refs with new location
      userLocationLatLngRef.current = L.latLng(latitude, longitude);
      userLocationAccuracyRef.current = accuracy;
      
      // Create or update markers - use updateLocationMarkers instead of createOrUpdateMarkers
      updateLocationMarkers(latitude, longitude, accuracy);
      
      // Determine safety level based on proximity to threats
      safetyLevelRef.current = getSafetyLevel(latitude, longitude);
    } catch (error) {
      console.error("Error handling location update:", error);
    }
  }, [map, updateLocationMarkers, getSafetyLevel]);
  
  // Center map on user location
  const centerMapOnUserLocation = useCallback(() => {
    if (!map || !userLocationLatLngRef.current) return;
    
    map.whenReady(() => {
      try {
        // Ensure map container is still in the DOM before attempting to setView
        if (map.getContainer() && document.body.contains(map.getContainer())) {
          map.setView(userLocationLatLngRef.current, 15, { animate: true });
        }
      } catch (error) {
        console.error("Error centering map:", error);
      }
    });
  }, [map]);
  
  return {
    handleLocationUpdate,
    centerMapOnUserLocation,
    cleanupMarkers: removeExistingMarkers, // Rename to match what's expected by consumers
    locationState: {
      userLocation: userLocationLatLngRef.current 
        ? [userLocationLatLngRef.current.lat, userLocationLatLngRef.current.lng] as [number, number]
        : null,
      locationAccuracy: userLocationAccuracyRef.current,
      safetyLevel: safetyLevelRef.current
    }
  };
}

export default useLocationUpdater;
