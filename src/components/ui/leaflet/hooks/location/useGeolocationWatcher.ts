
import { useRef, useCallback, useEffect } from 'react';
import L from 'leaflet';

/**
 * Hook for watching geolocation
 */
export function useGeolocationWatcher(
  onPositionUpdate: (position: GeolocationPosition) => void
) {
  const watchIdRef = useRef<number | null>(null);
  const errorCountRef = useRef<number>(0);
  
  // Start watching with high accuracy
  const startHighAccuracyWatch = useCallback(() => {
    // Clear any existing watch first
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    try {
      if (navigator.geolocation) {
        console.log("Starting high accuracy geolocation watch");
        watchIdRef.current = navigator.geolocation.watchPosition(
          onPositionUpdate,
          (error) => {
            errorCountRef.current++;
            console.error("Geolocation error:", error.message);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000
          }
        );
      } else {
        console.warn("Geolocation not supported by this browser");
      }
    } catch (error) {
      console.error("Error starting geolocation watch:", error);
    }
  }, [onPositionUpdate]);
  
  // Stop watching
  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      try {
        navigator.geolocation.clearWatch(watchIdRef.current);
        console.log("Stopped geolocation watch");
      } catch (error) {
        console.error("Error stopping geolocation watch:", error);
      }
      watchIdRef.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);
  
  return {
    startHighAccuracyWatch,
    stopWatch
  };
}

export default useGeolocationWatcher;
