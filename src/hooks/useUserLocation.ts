
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGeolocationWatch } from '@/hooks/location/useGeolocationWatch';
import { useLocationUpdater } from '@/hooks/location/useLocationUpdater';
import { useInitialLocation } from '@/hooks/location/useInitialLocation';

/**
 * Hook to get and track the user's location
 */
export default function useUserLocation() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const { toast } = useToast();

  // Update location with debouncing and validation
  const {
    handleLocationUpdate,
    setHighAccuracyMode,
    cleanup: cleanupLocationUpdater
  } = useLocationUpdater(setUserLocation, setLocationAccuracy);

  // Get geolocation watchers
  const {
    startHighAccuracyWatch,
    startStandardWatch,
    stopLocationWatch,
    isHighAccuracyMode,
    useDefaultLocation: useDefaultLocationFn
  } = useGeolocationWatch(handleLocationUpdate);

  // Define useDefaultLocation with default coordinates
  const useDefaultLocation = useCallback(() => {
    // Default to US center if no other location is available
    useDefaultLocationFn(37.0902, -95.7129, 5000);
    setIsTracking(false);
    
    toast({
      title: "Location Services Unavailable",
      description: "Please enable location services in your device settings.",
      variant: "destructive"
    });
  }, [useDefaultLocationFn, toast]);

  // Setup initial location fetch
  useInitialLocation({
    startHighAccuracyWatch,
    startStandardWatch,
    useDefaultLocation
  });

  // Effect to listen for high precision mode activation
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      console.log("High precision mode event received");
      setHighAccuracyMode(true);
      
      // If we're not tracking already, start tracking
      if (!isTracking) {
        setIsTracking(true);
        stopLocationWatch(); // Stop any existing watch
        startHighAccuracyWatch();
        
        toast({
          title: "High Precision Mode",
          description: "Getting your precise location...",
        });
      }
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    };
  }, [setHighAccuracyMode, isTracking, stopLocationWatch, startHighAccuracyWatch, toast]);

  // Center map on user location
  useEffect(() => {
    const handleCenterMapRequest = () => {
      if (userLocation) {
        document.dispatchEvent(new CustomEvent('centerMapOnUserLocation', {
          detail: { lat: userLocation[0], lng: userLocation[1] }
        }));
      } else {
        toast({
          title: "Location Not Available",
          description: "Unable to center map. Your location is not available.",
          variant: "destructive"
        });
      }
    };

    document.addEventListener('centerMapOnUserLocation', handleCenterMapRequest as EventListener);
    
    return () => {
      document.removeEventListener('centerMapOnUserLocation', handleCenterMapRequest as EventListener);
    };
  }, [userLocation, toast]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      cleanupLocationUpdater();
      stopLocationWatch();
    };
  }, [cleanupLocationUpdater, stopLocationWatch]);

  return {
    userLocation,
    locationAccuracy,
    setUserLocation,
    setLocationAccuracy,
    startHighAccuracyWatch,
    stopLocationWatch,
    isHighAccuracyMode: isHighAccuracyMode
  };
}
