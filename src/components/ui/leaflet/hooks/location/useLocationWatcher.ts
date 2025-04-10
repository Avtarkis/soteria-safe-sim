
import { useRef, useCallback } from 'react';
import L from 'leaflet';
import { LocationRefType } from './useLocationRefs';

/**
 * Hook to handle watching for location updates
 */
export function useLocationWatcher(
  map: L.Map | null,
  updateLocationMarkers: (lat: number, lng: number, accuracy: number) => void,
  locationRefs: LocationRefType
) {
  const {
    watchIdRef,
    locationTrackingInitializedRef,
    highPrecisionModeRef,
    errorCountRef
  } = locationRefs;
  
  // Start watching for location updates
  const startLocationWatch = useCallback(() => {
    if (!map) return;
    
    try {
      // Already tracking
      if (locationTrackingInitializedRef.current && watchIdRef.current) {
        console.log("Location tracking already initialized");
        return;
      }
      
      console.log("Starting high-precision location watch");
      
      // Use high precision mode by default
      highPrecisionModeRef.current = true;
      
      // Clear any existing watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      // Start browser geolocation tracking
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            updateLocationMarkers(latitude, longitude, accuracy);
            errorCountRef.current = 0; // Reset error count on success
          },
          (error) => {
            console.error("Geolocation error:", error.message);
            errorCountRef.current++;
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
          }
        );
      }
      
      // Use Leaflet's built-in location tracking as a fallback
      map.locate({
        watch: true,
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      
      locationTrackingInitializedRef.current = true;
    } catch (error) {
      console.error("Error starting location watch:", error);
    }
  }, [map, updateLocationMarkers, locationRefs, watchIdRef, locationTrackingInitializedRef, 
      highPrecisionModeRef, errorCountRef]);
  
  // Stop watching for location updates
  const stopLocationWatch = useCallback(() => {
    try {
      // Stop browser geolocation tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      // Stop Leaflet's built-in location tracking
      if (map) {
        map.stopLocate();
      }
      
      locationTrackingInitializedRef.current = false;
    } catch (error) {
      console.error("Error stopping location watch:", error);
    }
  }, [map, watchIdRef, locationTrackingInitializedRef]);
  
  return {
    startLocationWatch,
    stopLocationWatch
  };
}

export default useLocationWatcher;
