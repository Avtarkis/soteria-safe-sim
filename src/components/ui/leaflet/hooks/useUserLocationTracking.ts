
import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { cleanupStreetLabels } from './utils/streetLabels';
import { LocationHandler } from './utils/LocationHandler';
import { ThreatMarker } from '@/types/threats';
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
  // References for tracking map objects and state
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);
  const userLocationAccuracyRef = useRef<number>(0);
  const userLocationLatLngRef = useRef<L.LatLng | null>(null);
  const streetLabelRef = useRef<L.Marker | null>(null);
  const locationTrackingInitializedRef = useRef<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const lastEventTimeRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);
  const highPrecisionModeRef = useRef<boolean>(false);
  const safetyLevelRef = useRef<'safe' | 'caution' | 'danger'>('safe');
  const locationHandlerRef = useRef<LocationHandler | null>(null);
  
  // IMPORTANT: Always call hooks at the top level, never conditionally
  const { handleLocationUpdate, centerMapOnUserLocation, cleanupMarkers, locationState } = useLocationUpdater({ 
    map, 
    threatMarkers 
  });
  
  const { startHighAccuracyWatch, stopWatch } = useGeolocationWatcher(handleLocationUpdate);
  
  // Function to safely remove a map layer
  const safelyRemoveLayer = useCallback((layer: L.Layer | null) => {
    if (layer && map) {
      try {
        // Check if the layer is still on the map
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      } catch (error) {
        console.error("Error removing layer:", error);
      }
    }
    return null;
  }, [map]);
  
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
  }, [map, safelyRemoveLayer]);
  
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
  }, [map, threatMarkers, cleanupLocationLayers]);

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
  }, [map, centerMapOnUserLocation]);

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
