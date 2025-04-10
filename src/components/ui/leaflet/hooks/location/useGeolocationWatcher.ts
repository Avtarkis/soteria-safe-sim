
import { useRef, useCallback, useEffect } from 'react';
import L from 'leaflet';
import { GeoLocationWatcher } from '../../utils/location/GeoLocationWatcher';

/**
 * Hook for watching geolocation
 */
export function useGeolocationWatcher(
  onPositionUpdate: (position: GeolocationPosition) => void
) {
  const watcherRef = useRef<GeoLocationWatcher | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  // Create handler for synthetic location events
  const handleLocationEvent = useCallback((e: L.LocationEvent) => {
    // Convert to GeolocationPosition format
    const syntheticPosition: GeolocationPosition = {
      coords: {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        accuracy: e.accuracy,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        // Add required toJSON method
        toJSON: function() {
          return {
            latitude: this.latitude,
            longitude: this.longitude,
            accuracy: this.accuracy,
            altitude: this.altitude,
            altitudeAccuracy: this.altitudeAccuracy,
            heading: this.heading,
            speed: this.speed
          };
        }
      },
      timestamp: e.timestamp,
      // Add required toJSON method to the position object
      toJSON: function() {
        return {
          coords: this.coords.toJSON(),
          timestamp: this.timestamp
        };
      }
    };
    
    onPositionUpdate(syntheticPosition);
  }, [onPositionUpdate]);
  
  // Method to set map reference
  const setMap = useCallback((map: L.Map) => {
    mapRef.current = map;
    
    // Create new watcher if map changes
    if (map && !watcherRef.current) {
      watcherRef.current = new GeoLocationWatcher({
        map,
        onPositionUpdate: handleLocationEvent,
        onError: (error) => console.error("Geolocation error:", error.message)
      });
    }
  }, [handleLocationEvent]);
  
  // Start watching with high accuracy
  const startHighAccuracyWatch = useCallback(() => {
    if (!watcherRef.current && mapRef.current) {
      watcherRef.current = new GeoLocationWatcher({
        map: mapRef.current,
        onPositionUpdate: handleLocationEvent,
        onError: (error) => console.error("Geolocation error:", error.message)
      });
    }
    
    if (watcherRef.current) {
      watcherRef.current.startHighAccuracyWatch();
    }
  }, [handleLocationEvent]);
  
  // Start watching with standard accuracy
  const stopWatch = useCallback(() => {
    if (watcherRef.current) {
      watcherRef.current.stopWatch();
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watcherRef.current) {
        watcherRef.current.stopWatch();
      }
    };
  }, []);
  
  return {
    startHighAccuracyWatch,
    stopWatch,
    setMap
  };
}

export default useGeolocationWatcher;
