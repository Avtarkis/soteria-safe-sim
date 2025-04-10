
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';
import useUserLocationTracking from './useUserLocationTracking';

interface LocationTrackingConfig {
  map: L.Map | null;
  showUserLocation: boolean;
  threatMarkers: ThreatMarker[];
}

/**
 * Hook to handle location tracking for the Leaflet map
 */
const useLocationTracking = ({
  map,
  showUserLocation,
  threatMarkers = []
}: LocationTrackingConfig) => {
  // Initialize refs for state tracking that won't trigger re-renders
  const filteredLocation = useRef<[number, number] | null>(null);
  const filteredAccuracy = useRef<number>(0);
  const mapDebugLogShown = useRef<boolean>(false);
  
  // Always initialize the user location tracking hook - regardless of map status
  // This ensures hooks are always called in the same order
  const { 
    userLocation, 
    locationAccuracy, 
    safetyLevel 
  } = useUserLocationTracking({
    map,
    showUserLocation,
    threatMarkers
  });
  
  // Log map status for debugging - ensuring this hook is never conditional
  useEffect(() => {
    if (!mapDebugLogShown.current) {
      if (map) {
        console.log("Map instance provided to useLocationTracking:", map);
      } else {
        console.log("No map instance provided to useLocationTracking");
      }
      mapDebugLogShown.current = true;
    }
  }, [map]);
  
  // Filter locations based on accuracy
  useEffect(() => {
    if (!userLocation) return;
    
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
    // Don't return anything from useEffect
  }, [userLocation, locationAccuracy]);
  
  // Return location data for parent components
  return {
    userLocation: filteredLocation.current || userLocation,
    locationAccuracy: filteredAccuracy.current || locationAccuracy,
    safetyLevel
  };
};

export default useLocationTracking;
