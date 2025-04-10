
import { useEffect, useState, useCallback } from 'react';
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
export const useUserLocationTracking = ({
  map,
  showUserLocation,
  threatMarkers = []
}: LocationTrackingConfig) => {
  const [isTracking, setIsTracking] = useState(false);
  
  // Create location updater
  const { 
    handleLocationUpdate, 
    centerMapOnUserLocation,
    cleanupMarkers,
    locationState
  } = useLocationUpdater({ map, threatMarkers });
  
  // Create geolocation watcher
  const { startHighAccuracyWatch, stopWatch } = useGeolocationWatcher(handleLocationUpdate);
  
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

  return locationState;
};

export default useUserLocationTracking;
