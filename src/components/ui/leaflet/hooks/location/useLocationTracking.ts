
import { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';
import { useLocationRefs } from './useLocationRefs';
import { useMapCleanup } from './useMapCleanup';
import { useLocationMarkers } from './useLocationMarkers';
import { useLocationWatcher } from './useLocationWatcher';

interface UseLocationTrackingProps {
  map: L.Map | null;
  showUserLocation: boolean;
  threatMarkers: ThreatMarker[];
}

/**
 * Hook to handle user location tracking on a map
 */
export function useLocationTracking({
  map,
  showUserLocation,
  threatMarkers = []
}: UseLocationTrackingProps) {
  const [isTracking, setIsTracking] = useState(false);
  
  // Get refs for storing location state
  const locationRefs = useLocationRefs();
  const {
    userLocationLatLngRef,
    userLocationAccuracyRef,
    safetyLevelRef
  } = locationRefs;
  
  // Get cleanup utilities
  const { cleanupLocationLayers } = useMapCleanup(map, locationRefs);
  
  // Get location markers manager
  const { updateLocationMarkers } = useLocationMarkers(map, locationRefs, threatMarkers);
  
  // Get location watcher
  const { startLocationWatch, stopLocationWatch } = useLocationWatcher(
    map, 
    updateLocationMarkers,
    locationRefs
  );
  
  /**
   * Effect to handle location tracking based on showUserLocation prop
   */
  useEffect(() => {
    if (!map) return;
    
    // Check if map is valid
    try {
      if (!map.getContainer() || !document.body.contains(map.getContainer())) {
        console.log("Map container not in DOM");
        return;
      }
    } catch (error) {
      console.error("Error checking map container:", error);
      return;
    }
    
    if (showUserLocation && !isTracking) {
      console.log("Starting location tracking");
      startLocationWatch();
      setIsTracking(true);
    } else if (!showUserLocation && isTracking) {
      console.log("Stopping location tracking");
      stopLocationWatch();
      cleanupLocationLayers();
      setIsTracking(false);
    }
    
    return () => {
      stopLocationWatch();
      cleanupLocationLayers();
      setIsTracking(false);
    };
  }, [map, showUserLocation, isTracking, startLocationWatch, stopLocationWatch, cleanupLocationLayers]);
  
  // Return current location state
  return {
    userLocation: userLocationLatLngRef.current 
      ? [userLocationLatLngRef.current.lat, userLocationLatLngRef.current.lng] as [number, number]
      : null,
    locationAccuracy: userLocationAccuracyRef.current,
    safetyLevel: safetyLevelRef.current
  };
}

export default useLocationTracking;
