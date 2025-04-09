
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';
import useUserLocationTracking from './hooks/useUserLocationTracking';

/**
 * Hook to handle location tracking for the Leaflet map
 */
const useLocationTracking = (
  map: L.Map | null,
  showUserLocation: boolean,
  threatMarkers: ThreatMarker[] = []
) => {
  // Use the refactored hook for better organization
  const { 
    userLocation, 
    locationAccuracy, 
    safetyLevel 
  } = useUserLocationTracking(map, showUserLocation, threatMarkers);

  // For debugging
  useEffect(() => {
    if (userLocation) {
      console.log('Updating location:', userLocation[0], userLocation[1], 'accuracy:', locationAccuracy);
    }
  }, [userLocation, locationAccuracy]);

  // Return location data for parent components
  return {
    userLocation,
    locationAccuracy,
    safetyLevel
  };
};

export default useLocationTracking;
