
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Use refs to track state
  const locationInitializedRef = useRef(false);
  const debouncedLocationUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const previousLocationRef = useRef<[number, number] | null>(null);
  const errorCountRef = useRef<number>(0);
  const highAccuracyModeRef = useRef<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const geoLocationOptionsRef = useRef({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  });

  // Handle location update with debounce for performance
  const handleLocationUpdate = useCallback((lat: number, lng: number, accuracy: number) => {
    // Skip if the location hasn't changed significantly
    if (previousLocationRef.current) {
      const [prevLat, prevLng] = previousLocationRef.current;
      const distance = Math.sqrt(
        Math.pow((lat - prevLat) * 111000, 2) + 
        Math.pow((lng - prevLng) * 111000 * Math.cos(prevLat * Math.PI/180), 2)
      );
      
      // If the distance is less than 0.1 meters and accuracy hasn't improved by 10%, skip
      if (distance < 0.1 && locationAccuracy && (accuracy > locationAccuracy * 0.9)) {
        return;
      }
    }
    
    // Clear existing timeout if there is one
    if (debouncedLocationUpdateRef.current) {
      clearTimeout(debouncedLocationUpdateRef.current);
    }
    
    // Update with a short debounce for UI responsiveness
    debouncedLocationUpdateRef.current = setTimeout(() => {
      console.log("Updating location:", lat, lng, "accuracy:", accuracy);
      
      setUserLocation([lat, lng]);
      setLocationAccuracy(accuracy);
      previousLocationRef.current = [lat, lng];
      
      // Only show notification for first update or significant accuracy improvements
      if (!locationInitializedRef.current) {
        toast({
          title: "Location Detected",
          description: `Your location has been detected with accuracy of ±${accuracy.toFixed(1)}m`,
        });
        locationInitializedRef.current = true;
      } else if (highAccuracyModeRef.current && accuracy < 100) {
        toast({
          title: "High Precision Active",
          description: `Location tracking at ±${accuracy.toFixed(1)}m precision`,
        });
        highAccuracyModeRef.current = false;
      }
      
      // Reset error count on successful update
      errorCountRef.current = 0;
      
      // Dispatch event for other components
      document.dispatchEvent(new CustomEvent('userLocationUpdated', {
        detail: { lat, lng, accuracy }
      }));
    }, 150);
  }, [toast, locationAccuracy]);

  // Request high accuracy location
  const requestHighAccuracyLocation = useCallback(() => {
    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    // Set high accuracy mode flag
    highAccuracyModeRef.current = true;
    
    // Try to get a high accuracy fix
    if (navigator.geolocation) {
      console.log("Requesting high-accuracy location");
      
      // First get a single position fix
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          handleLocationUpdate(latitude, longitude, accuracy);
          
          // Start watching with maximum precision
          watchIdRef.current = navigator.geolocation.watchPosition(
            (watchPosition) => {
              const { latitude, longitude, accuracy } = watchPosition.coords;
              handleLocationUpdate(latitude, longitude, accuracy);
            },
            (error) => {
              console.warn("Watch position error:", error);
              
              // Try a fallback approach with lower requirements
              useFallbackLocation();
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        },
        (error) => {
          console.error("High accuracy position error:", error);
          useFallbackLocation();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, [handleLocationUpdate]);
  
  // Fallback to more permissive location settings
  const useFallbackLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          handleLocationUpdate(latitude, longitude, accuracy);
        },
        (error) => {
          console.error("Fallback position error:", error);
          
          // If all fails, use IP-based geolocation or default location
          useDefaultLocation();
        },
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 30000
        }
      );
    } else {
      useDefaultLocation();
    }
  }, [handleLocationUpdate]);
  
  // Set a default location as last resort
  const useDefaultLocation = useCallback(() => {
    const defaultLat = 37.0902;
    const defaultLng = -95.7129;
    const defaultAccuracy = 5000;
    
    setUserLocation([defaultLat, defaultLng]);
    setLocationAccuracy(defaultAccuracy);
    
    toast({
      title: "Location Detection Failed",
      description: "Using default location. Please enable location services.",
      variant: "destructive"
    });
  }, [toast]);

  // Listen for high precision mode activation
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      console.log("High precision mode activated");
      highAccuracyModeRef.current = true;
      requestHighAccuracyLocation();
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    };
  }, [requestHighAccuracyLocation]);

  // Initial location detection - only run once
  useEffect(() => {
    if (locationInitializedRef.current) return;
    
    try {
      requestHighAccuracyLocation();
    } catch (error) {
      console.error("Error initializing location:", error);
      useDefaultLocation();
    }
    
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (debouncedLocationUpdateRef.current) {
        clearTimeout(debouncedLocationUpdateRef.current);
      }
    };
  }, [requestHighAccuracyLocation, useDefaultLocation]);

  return {
    userLocation,
    locationAccuracy,
    setUserLocation,
    setLocationAccuracy
  };
};

export default useUserLocation;
