
import L from 'leaflet';

export type GeoLocationWatcherConfig = {
  map: L.Map;
  onPositionUpdate: (position: GeolocationPosition) => void;
  onError: (error: GeolocationPositionError) => void;
};

/**
 * Factory for creating a geolocation watcher
 */
export const createGeoLocationWatcher = (config: GeoLocationWatcherConfig) => {
  const { onPositionUpdate, onError } = config;
  
  let watchId: number | null = null;
  
  // Options for high accuracy geolocation
  const highAccuracyOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };
  
  // Options for low accuracy fallback
  const lowAccuracyOptions = {
    enableHighAccuracy: false,
    timeout: 20000,
    maximumAge: 30000
  };

  /**
   * Starts high accuracy geolocation watching
   */
  const startHighAccuracyWatch = () => {
    // Clear any existing watch
    stopWatch();
    
    // Start a new high accuracy watch
    if (navigator.geolocation) {
      try {
        watchId = navigator.geolocation.watchPosition(
          onPositionUpdate,
          (error) => {
            console.warn('High accuracy geolocation failed:', error.message);
            onError(error);
            
            // Fall back to low accuracy if high accuracy fails
            startLowAccuracyWatch();
          },
          highAccuracyOptions
        );
      } catch (error) {
        console.error('Failed to start high accuracy geolocation watch:', error);
        startLowAccuracyWatch();
      }
    } else {
      console.error('Geolocation is not supported by this browser');
    }
  };
  
  /**
   * Starts low accuracy geolocation watching (fallback)
   */
  const startLowAccuracyWatch = () => {
    // Clear any existing watch
    stopWatch();
    
    if (navigator.geolocation) {
      try {
        watchId = navigator.geolocation.watchPosition(
          onPositionUpdate,
          onError,
          lowAccuracyOptions
        );
      } catch (error) {
        console.error('Failed to start low accuracy geolocation watch:', error);
      }
    }
  };
  
  /**
   * Stops geolocation watching
   */
  const stopWatch = () => {
    if (watchId !== null) {
      try {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      } catch (error) {
        console.error('Error stopping geolocation watch:', error);
      }
    }
  };
  
  return {
    startHighAccuracyWatch,
    startLowAccuracyWatch,
    stopWatch
  };
};
