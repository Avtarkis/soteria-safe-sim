
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
  setUserLocation?: (location: [number, number]) => void,
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
        setUserLocation,
        errorCountRef,
        lastEventTimeRef
      });
    }
  }, [map, threatMarkers, setUserLocation]);
  
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
        centerMapOnUserLocation();
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
    
    // Set up event listeners
    const handleFound = locationHandler.handleLocationFound;
    const handleError = (e: L.ErrorEvent) => locationHandler.handleLocationError(e, watchIdRef);
    
    map.on('locationfound', handleFound);
    map.on('locationerror', handleError);
    
    // Start location tracking if enabled
    if (showUserLocation && !isTracking) {
      console.log("Starting high-precision location tracking");
      
      highPrecisionModeRef.current = true;
      
      // Clear any existing tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      if (map.stopLocate) {
        map.stopLocate();
      }
      
      // Start map's built-in location tracking
      map.locate({ 
        setView: false,
        maxZoom: 19, 
        watch: true,
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      
      // Start browser geolocation tracking as fallback
      geoLocationWatcher.startHighAccuracyWatch();
      
      locationTrackingInitializedRef.current = true;
      setIsTracking(true);
    } 
    // Handle disabling location tracking
    else if (!showUserLocation && isTracking) {
      console.log("Stopping location tracking");
      
      // Remove markers
      if (userLocationMarkerRef.current) {
        try {
          map.removeLayer(userLocationMarkerRef.current);
          userLocationMarkerRef.current = null;
        } catch (error) {
          console.error("Error removing marker on toggle off:", error);
        }
      }
      if (userLocationCircleRef.current) {
        try {
          map.removeLayer(userLocationCircleRef.current);
          userLocationCircleRef.current = null;
        } catch (error) {
          console.error("Error removing circle on toggle off:", error);
        }
      }
      if (streetLabelRef.current) {
        try {
          map.removeLayer(streetLabelRef.current);
          streetLabelRef.current = null;
        } catch (error) {
          console.error("Error removing street label on toggle off:", error);
        }
      }
      
      // Stop location tracking
      map.stopLocate();
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
          
          cleanupStreetLabels();
        } catch (error) {
          console.error("Error cleaning up location tracking:", error);
        }
      }
    };
  }, [map, showUserLocation, isTracking, setUserLocation]);

  /**
   * Effect to handle "center map on user" requests
   */
  useEffect(() => {
    const handleCenterMap = () => {
      if (locationHandlerRef.current) {
        locationHandlerRef.current.centerMapOnUserLocation();
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
    safetyLevel: safetyLevelRef.current
  };
};

export default useUserLocationTracking;
