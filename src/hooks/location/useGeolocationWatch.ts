
import { useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GeolocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

export function useGeolocationWatch(
  onLocationUpdate: (lat: number, lng: number, accuracy: number) => void
) {
  const { toast } = useToast();
  const watchIdRef = useRef<number | null>(null);
  const errorCountRef = useRef<number>(0);
  const highAccuracyModeRef = useRef<boolean>(false);

  // Options for geolocation
  const getGeolocationOptions = useCallback((highAccuracy = false): GeolocationOptions => {
    return {
      enableHighAccuracy: highAccuracy,
      timeout: highAccuracy ? 20000 : 15000, // Increased timeout for high accuracy
      maximumAge: highAccuracy ? 0 : 30000
    };
  }, []);

  // Start watching location with high accuracy
  const startHighAccuracyWatch = useCallback(() => {
    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    highAccuracyModeRef.current = true;
    
    if (navigator.geolocation) {
      console.log("Starting high-accuracy location watch");
      
      // First get a single position fix
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          onLocationUpdate(latitude, longitude, accuracy);
          
          // Start watching with maximum precision
          watchIdRef.current = navigator.geolocation.watchPosition(
            (watchPosition) => {
              const { latitude, longitude, accuracy } = watchPosition.coords;
              onLocationUpdate(latitude, longitude, accuracy);
            },
            (error) => {
              console.warn("Watch position error:", error);
              errorCountRef.current += 1;
              
              if (errorCountRef.current > 3) {
                // Fall back to standard accuracy after multiple errors
                startStandardWatch();
              }
            },
            getGeolocationOptions(true)
          );
        },
        (error) => {
          console.error("High accuracy position error:", error);
          startStandardWatch();
        },
        getGeolocationOptions(true)
      );
    } else {
      toast({
        title: "Location Not Available",
        description: "Geolocation is not supported by this browser or device.",
        variant: "destructive"
      });
    }
  }, [onLocationUpdate, toast, getGeolocationOptions]);

  // Start watching with standard accuracy (fallback)
  const startStandardWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (navigator.geolocation) {
      console.log("Starting standard-accuracy location watch");
      
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          onLocationUpdate(latitude, longitude, accuracy);
          // Reset error count on successful update
          errorCountRef.current = 0;
        },
        (error) => {
          console.error("Standard watch position error:", error);
          errorCountRef.current += 1;
          
          if (errorCountRef.current > 5) {
            toast({
              title: "Location Tracking Issue",
              description: "Having trouble with continuous location tracking.",
              variant: "destructive"
            });
          }
        },
        getGeolocationOptions(false)
      );
    }
  }, [onLocationUpdate, toast, getGeolocationOptions]);

  // Cleanup function
  const stopLocationWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Use a specific location (for testing or default fallback)
  const useDefaultLocation = useCallback((lat: number = 37.0902, lng: number = -95.7129, accuracy: number = 5000) => {
    onLocationUpdate(lat, lng, accuracy);
    
    toast({
      title: "Using Default Location",
      description: "Could not detect your actual location. Using default position.",
      variant: "destructive"
    });
  }, [onLocationUpdate, toast]);

  // Activation of high precision mode
  useEffect(() => {
    const handleHighPrecisionActivation = () => {
      console.log("High precision mode activated");
      highAccuracyModeRef.current = true;
      startHighAccuracyWatch();
      
      toast({
        title: "High Precision Mode",
        description: "Activated enhanced location precision.",
      });
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionActivation);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionActivation);
      stopLocationWatch();
    };
  }, [startHighAccuracyWatch, stopLocationWatch, toast]);

  return {
    startHighAccuracyWatch,
    startStandardWatch,
    stopLocationWatch,
    useDefaultLocation,
    isHighAccuracyMode: () => highAccuracyModeRef.current
  };
}
