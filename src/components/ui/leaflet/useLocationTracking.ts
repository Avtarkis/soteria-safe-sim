
import { useEffect, useState, useRef, useCallback } from 'react';
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
  // Use the refactored hook
  const { 
    userLocation, 
    locationAccuracy, 
    safetyLevel 
  } = useUserLocationTracking({
    map,
    showUserLocation,
    threatMarkers
  });

  // Log map status for debugging
  useEffect(() => {
    if (map) {
      console.log("Map instance provided to useLocationTracking:", map);
    } else {
      console.log("No map instance provided to useLocationTracking");
    }
  }, [map]);
  
  // Filter out locations with poor accuracy (>50km)
  const filteredLocation = useRef<[number, number] | null>(null);
  const filteredAccuracy = useRef<number>(0);
  
  useEffect(() => {
    if (userLocation) {
      // Default accuracy threshold (meters)
      const ACCURACY_THRESHOLD = 50000; // 50km - allowing for cell/wifi location
      
      if (locationAccuracy && locationAccuracy < ACCURACY_THRESHOLD) {
        // Location accuracy is acceptable
        filteredLocation.current = userLocation;
        filteredAccuracy.current = locationAccuracy;
        console.log('Valid location update:', userLocation[0].toFixed(6), userLocation[1].toFixed(6), 'accuracy:', locationAccuracy.toFixed(1), 'm');
      } else if (locationAccuracy) {
        console.warn('Ignoring location with poor accuracy:', locationAccuracy, 'meters');
        // If we have no better location, still use it
        if (!filteredLocation.current) {
          filteredLocation.current = userLocation;
          filteredAccuracy.current = locationAccuracy;
          console.log('Using first location despite poor accuracy');
        }
      }
    }
  }, [userLocation, locationAccuracy]);
  
  // Return location data for parent components
  return {
    userLocation: filteredLocation.current || userLocation,
    locationAccuracy: filteredAccuracy.current || locationAccuracy,
    safetyLevel
  };
};

export default useLocationTracking;
