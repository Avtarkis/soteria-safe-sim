
import { useState, useRef, useCallback, useEffect } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';
import { useGeolocationWatcher } from './location/useGeolocationWatcher';
import { useLocationUpdater } from './location/useLocationUpdater';

interface LocationTrackingConfig {
  map: L.Map | null;
  showUserLocation: boolean;
  threatMarkers: ThreatMarker[];
}

/**
 * Hook to track and visualize user location on a Leaflet map
 */
export const useLocationTracking = ({
  map,
  showUserLocation,
  threatMarkers = []
}: LocationTrackingConfig) => {
  const [isTracking, setIsTracking] = useState(false);
  const locationStateRef = useRef({
    userLocation: null as [number, number] | null,
    locationAccuracy: 0,
    safetyLevel: 'safe' as 'safe' | 'caution' | 'danger'
  });
  
  // Create location updater
  const { 
    handleLocationUpdate, 
    centerMapOnUserLocation,
    cleanupMarkers
  } = useLocationUpdater({ map, threatMarkers });
  
  // Create geolocation watcher
  const { startHighAccuracyWatch, stopWatch, setMap } = useGeolocationWatcher(handleLocationUpdate);
  
  // Set the map reference when it changes
  useEffect(() => {
    if (map) {
      setMap(map);
    }
  }, [map, setMap]);
  
  // Start/stop location tracking based on props
  useEffect(() => {
    // Early return if no map or map container not in DOM
    if (!map) {
      console.log("Map not available for location tracking");
      return;
    }
    
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
      
      // Start high accuracy tracking
      startHighAccuracyWatch();
      setIsTracking(true);
    } else if (!showUserLocation && isTracking) {
      console.log("Stopping location tracking");
      
      cleanupMarkers();
      stopWatch();
      setIsTracking(false);
    }
    
    return () => {
      stopWatch();
      cleanupMarkers();
    };
  }, [map, showUserLocation, isTracking, cleanupMarkers, startHighAccuracyWatch, stopWatch]);
  
  // Listen for center map events
  useEffect(() => {
    // Skip if no map
    if (!map) return;
    
    const handleCenterMap = () => centerMapOnUserLocation();
    document.addEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    
    return () => {
      document.removeEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    };
  }, [centerMapOnUserLocation, map]);

  // Update location state when location updater changes
  useEffect(() => {
    if (handleLocationUpdate) {
      // This ensures we're always returning the same object shape
      // regardless of whether location tracking is active
      return locationStateRef.current;
    }
  }, [handleLocationUpdate]);

  return {
    userLocation: locationStateRef.current.userLocation,
    locationAccuracy: locationStateRef.current.locationAccuracy,
    safetyLevel: locationStateRef.current.safetyLevel 
  };
};

export default useLocationTracking;
