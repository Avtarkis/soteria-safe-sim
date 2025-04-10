
import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';
import { useLocationRefs } from './location/useLocationRefs';
import { useMapCleanup } from './location/useMapCleanup';
import { cleanupStreetLabels } from '../utils/streetLabels';
import { LocationHandler } from '../utils/LocationHandler';
import useLocationUpdater from './location/useLocationUpdater';
import useGeolocationWatcher from './location/useGeolocationWatcher';

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
    userLocationMarkerRef,
    userLocationCircleRef,
    streetLabelRef,
    userLocationLatLngRef,
    userLocationAccuracyRef,
    safetyLevelRef,
    locationTrackingInitializedRef,
    watchIdRef,
    lastEventTimeRef,
    errorCountRef,
    highPrecisionModeRef
  } = locationRefs;
  
  // State for tracking activation status
  const [isTracking, setIsTracking] = useState(false);
  
  // Location handler reference
  const locationHandlerRef = useRef<LocationHandler | null>(null);
  
  // Get cleanup utilities
  const { safelyRemoveLayer } = useMapCleanup(map);
  
  // IMPORTANT: Always call hooks at the top level, never conditionally
  const { handleLocationUpdate, centerMapOnUserLocation, cleanupMarkers, locationState } = useLocationUpdater({
    map,
    threatMarkers
  });
  
  const { startHighAccuracyWatch, stopWatch } = useGeolocationWatcher(handleLocationUpdate);
  
  // Function to safely clean up all location layers
  const cleanupLocationLayers = useCallback(() => {
    if (!map) return;
    
    try {
      userLocationMarkerRef.current = safelyRemoveLayer(userLocationMarkerRef.current);
      userLocationCircleRef.current = safelyRemoveLayer(userLocationCircleRef.current);
      streetLabelRef.current = safelyRemoveLayer(streetLabelRef.current);
      
      // Additional cleanup for street labels
      cleanupStreetLabels();
    } catch (error) {
      console.error("Error in location layers cleanup:", error);
    }
  }, [map, safelyRemoveLayer, userLocationMarkerRef, userLocationCircleRef, streetLabelRef]);
  
  // Initialize location handler if not already done
  useEffect(() => {
    if (map && !locationHandlerRef.current) {
      locationHandlerRef.current = new LocationHandler({
        map,
        userLocationMarkerRef,
        userLocationCircleRef,
        userLocationAccuracyRef,
        userLocationLatLngRef,
        streetLabelRef,
        highPrecisionModeRef,
        safetyLevelRef,
        locationTrackingInitializedRef,
        threatMarkers,
        setUserLocation: undefined,
        errorCountRef,
        lastEventTimeRef
      });
    }
    
    return () => {
      // Clean up location layers when component unmounts
      cleanupLocationLayers();
    };
  }, [map, threatMarkers, cleanupLocationLayers, userLocationMarkerRef, userLocationCircleRef, 
      userLocationAccuracyRef, userLocationLatLngRef, streetLabelRef, highPrecisionModeRef,
      safetyLevelRef, locationTrackingInitializedRef, errorCountRef, lastEventTimeRef]);

  /**
   * Effect to listen for high precision mode activation
   */
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      highPrecisionModeRef.current = true;
      
      // Update map if we have a current user location
      if (userLocationLatLngRef.current && map && locationHandlerRef.current) {
        // Safely call with try/catch
        try {
          centerMapOnUserLocation();
        } catch (error) {
          console.error("Error centering map on high precision mode:", error);
        }
      }
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    };
  }, [map, centerMapOnUserLocation, userLocationLatLngRef]);

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
      startHighAccuracyWatch();
    } else {
      console.log("Stopping location tracking");
      cleanupMarkers();
      stopWatch();
    }

    // Always set tracking state based on prop — no conditions
    setIsTracking(showUserLocation);

    return () => {
      stopWatch();
      cleanupMarkers();
      setIsTracking(false); // Reset on unmount
    };
  }, [map, showUserLocation, cleanupMarkers, startHighAccuracyWatch, stopWatch]);

  /**
   * Effect to handle "center map on user" requests
   */
  useEffect(() => {
    const handleCenterMap = () => {
      if (locationHandlerRef.current) {
        try {
          locationHandlerRef.current.centerMapOnUserLocation();
        } catch (error) {
          console.error("Error centering map on user location:", error);
        }
      }
    };

    document.addEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    
    return () => {
      document.removeEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    };
  }, [map]);

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
