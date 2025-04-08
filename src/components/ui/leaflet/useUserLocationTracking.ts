
import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { cleanupStreetLabels } from './utils/streetLabels';
import { LocationHandler } from './utils/LocationHandler';
import { GeoLocationWatcher } from './utils/GeoLocationWatcher';

/**
 * Hook to track and visualize user location on a Leaflet map
 */
export const useUserLocationTracking = (
  map: L.Map | null,
  showUserLocation: boolean,
  threatMarkers: any[] = []
) => {
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
  
  // Create location handler instance
  const locationHandlerRef = useRef<LocationHandler | null>(null);
  
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
  
  // Create geolocation watcher
  const geoLocationWatcherRef = useRef<GeoLocationWatcher | null>(null);
  
  // Initialize geolocation watcher
  useEffect(() => {
    if (map && !geoLocationWatcherRef.current && locationHandlerRef.current) {
      geoLocationWatcherRef.current = new GeoLocationWatcher({
        map,
        onPositionUpdate: locationHandlerRef.current.handleLocationFound,
        onError: (error) => {
          console.error('Geolocation error:', error.message);
          errorCountRef.current++;
        }
      });
    }
    
    return () => {
      if (geoLocationWatcherRef.current) {
        geoLocationWatcherRef.current.stopWatch();
        geoLocationWatcherRef.current = null;
      }
    };
  }, [map]);

  /**
   * Effect to listen for high precision mode activation
   */
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      highPrecisionModeRef.current = true;
      
      // Update map if we have a current user location
      if (userLocationLatLngRef.current && map && locationHandlerRef.current) {
        const { centerMapOnUserLocation } = locationHandlerRef.current;
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
  }, [map]);

  /**
   * Main effect to handle location tracking based on showUserLocation prop
   */
  useEffect(() => {
    if (!map || !locationHandlerRef.current || !geoLocationWatcherRef.current) return;
    
    const locationHandler = locationHandlerRef.current;
    const geoLocationWatcher = geoLocationWatcherRef.current;
    
    // Set up event listeners with safe error handling
    const handleFound = (e: L.LocationEvent) => {
      try {
        locationHandler.handleLocationFound(e);
      } catch (error) {
        console.error("Error handling location found:", error);
      }
    };
    
    const handleError = (e: L.ErrorEvent) => {
      try {
        locationHandler.handleLocationError(e, watchIdRef);
      } catch (error) {
        console.error("Error handling location error:", error);
      }
    };
    
    map.on('locationfound', handleFound);
    map.on('locationerror', handleError);
    
    // Start location tracking if enabled
    if (showUserLocation && !isTracking) {
      console.log("Starting high-precision location tracking");
      
      highPrecisionModeRef.current = true;
      
      // Clean up any existing state first
      cleanupLocationLayers();
      
      // Clear any existing tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      if (map.stopLocate) {
        try {
          map.stopLocate();
        } catch (error) {
          console.error("Error stopping locate:", error);
        }
      }
      
      // Start map's built-in location tracking
      try {
        map.locate({ 
          setView: false,
          maxZoom: 19, 
          watch: true,
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      } catch (error) {
        console.error("Error starting locate:", error);
      }
      
      // Start browser geolocation tracking as fallback
      geoLocationWatcher.startHighAccuracyWatch();
      
      locationTrackingInitializedRef.current = true;
      setIsTracking(true);
    } 
    // Handle disabling location tracking
    else if (!showUserLocation && isTracking) {
      console.log("Stopping location tracking");
      
      // Clean up all location markers
      cleanupLocationLayers();
      
      // Stop location tracking
      try {
        map.stopLocate();
      } catch (error) {
        console.error("Error stopping locate:", error);
      }
      
      geoLocationWatcher.stopWatch();
      
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      setIsTracking(false);
    }

    // Cleanup function
    return () => {
      if (map) {
        try {
          map.off('locationfound', handleFound);
          map.off('locationerror', handleError);
          
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          
          if (geoLocationWatcher) {
            geoLocationWatcher.stopWatch();
          }
          
          cleanupLocationLayers();
        } catch (error) {
          console.error("Error cleaning up location tracking:", error);
        }
      }
    };
  }, [map, showUserLocation, isTracking, cleanupLocationLayers]);

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
