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
  // Use the refactored hook for better organization
  const { 
    userLocation, 
    locationAccuracy, 
    safetyLevel 
  } = useUserLocationTracking(map, showUserLocation, threatMarkers);

  // Additional logging for map debugging
  useEffect(() => {
    if (map) {
      console.log("Map instance provided to useLocationTracking:", map);
    } else {
      console.log("No map instance provided to useLocationTracking");
    }
  }, [map]);
  
  // Filter out locations with poor accuracy (>1000m)
  const filteredLocation = useRef<[number, number] | null>(null);
  const filteredAccuracy = useRef<number>(0);
  
  useEffect(() => {
    // If we have a location update, validate the accuracy
    if (userLocation) {
      // Default accuracy threshold (meters)
      const ACCURACY_THRESHOLD = 1000;
      
      if (locationAccuracy && locationAccuracy < ACCURACY_THRESHOLD) {
        // Location accuracy is acceptable
        filteredLocation.current = userLocation;
        filteredAccuracy.current = locationAccuracy;
        console.log('Valid location update:', userLocation[0], userLocation[1], 'accuracy:', locationAccuracy);
      } else {
        console.warn('Ignoring location with poor accuracy:', locationAccuracy, 'meters');
        // Keep the previous good location if we have one
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
