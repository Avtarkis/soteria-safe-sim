
import { useRef, useCallback } from 'react';
import L from 'leaflet';

/**
 * Hook for watching geolocation
 */
export function useGeolocationWatcher(
  onPositionUpdate: (position: GeolocationPosition) => void
) {
  const watchIdRef = useRef<number | null>(null);
  
  // Start watching with high accuracy
  const startHighAccuracyWatch = useCallback(() => {
    // Clean up any existing watcher
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    
    // Start high accuracy tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      onPositionUpdate,
      (error) => console.error("Geolocation error:", error.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    
    console.log("Started high-accuracy geolocation watch");
  }, [onPositionUpdate]);
  
  // Stop watching
  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log("Stopped geolocation watch");
    }
  }, []);
  
  return {
    startHighAccuracyWatch,
    stopWatch
  };
}

export default useGeolocationWatcher;
