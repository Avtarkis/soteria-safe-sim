
import { useEffect } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';
import { useLocationRefs } from './location/useLocationRefs';
import { useMapCleanup } from './location/useMapCleanup';
import { useLocationMarkers } from './location/useLocationMarkers';
import { useLocationWatcher } from './location/useLocationWatcher';

interface UserLocationTrackingProps {
  map: L.Map | null;
  showUserLocation: boolean;
  threatMarkers: ThreatMarker[];
}

/**
 * Hook to track and visualize user location on a Leaflet map
 */
const useUserLocationTracking = ({
  map,
  showUserLocation,
  threatMarkers = []
}: UserLocationTrackingProps) => {
  // Get all location refs
  const locationRefs = useLocationRefs();
  const {
    userLocationLatLngRef,
    userLocationAccuracyRef,
    safetyLevelRef,
    locationTrackingInitializedRef,
    highPrecisionModeRef
  } = locationRefs;
  
  // Get cleanup utilities
  const { cleanupLocationLayers } = useMapCleanup(map, locationRefs);
  
  // Get location markers manager
  const { updateLocationMarkers, removeExistingMarkers } = useLocationMarkers(map, locationRefs, threatMarkers);
  
  // Get location watcher
  const { startLocationWatch, stopLocationWatch } = useLocationWatcher(
    map, 
    updateLocationMarkers,
    locationRefs
  );

  /**
   * Effect to handle high precision mode activation
   */
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      highPrecisionModeRef.current = true;
      
      // If we're already tracking, restart with high precision
      if (locationTrackingInitializedRef.current && showUserLocation) {
        stopLocationWatch();
        startLocationWatch();
      }
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    };
  }, [locationTrackingInitializedRef, showUserLocation, highPrecisionModeRef, startLocationWatch, stopLocationWatch]);

  /**
   * Main effect to handle location tracking based on showUserLocation prop
   */
  useEffect(() => {
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

    if (showUserLocation) {
      console.log("Starting location tracking");
      startLocationWatch();
    } else {
      console.log("Stopping location tracking");
      cleanupLocationLayers();
      stopLocationWatch();
    }

    return () => {
      stopLocationWatch();
      cleanupLocationLayers();
    };
  }, [map, showUserLocation, cleanupLocationLayers, startLocationWatch, stopLocationWatch]);

  /**
   * Effect to handle "center map on user" requests
   */
  useEffect(() => {
    const handleCenterMap = () => {
      if (map && userLocationLatLngRef.current) {
        try {
          map.setView(userLocationLatLngRef.current, 15, { animate: true });
        } catch (error) {
          console.error("Error centering map on user location:", error);
        }
      }
    };

    document.addEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    
    return () => {
      document.removeEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    };
  }, [map, userLocationLatLngRef]);

  return {
    getUserLocation: (): [number, number] | null => {
      if (userLocationLatLngRef.current) {
        return [userLocationLatLngRef.current.lat, userLocationLatLngRef.current.lng];
      }
      return null;
    },
    locationAccuracy: userLocationAccuracyRef.current,
    safetyLevel: safetyLevelRef.current,
    userLocation: userLocationLatLngRef.current 
      ? [userLocationLatLngRef.current.lat, userLocationLatLngRef.current.lng] as [number, number]
      : null
  };
};

export default useUserLocationTracking;
