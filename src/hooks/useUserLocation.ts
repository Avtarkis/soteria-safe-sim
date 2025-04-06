import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Use refs to track if location has been initialized
  const locationInitializedRef = useRef(false);
  const debouncedLocationUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const previousLocationRef = useRef<[number, number] | null>(null);
  const errorCountRef = useRef<number>(0);
  const highAccuracyModeRef = useRef<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const positionOptions = useRef({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });

  // Create a stable callback for location updates
  const handleLocationUpdate = useCallback((lat: number, lng: number, accuracy: number) => {
    try {
      // Skip if the location hasn't changed significantly (within 0.5 meter for high accuracy)
      if (previousLocationRef.current) {
        const [prevLat, prevLng] = previousLocationRef.current;
        const distance = Math.sqrt(
          Math.pow((lat - prevLat) * 111000, 2) + 
          Math.pow((lng - prevLng) * 111000 * Math.cos(prevLat * Math.PI/180), 2)
        );
        
        // If the distance is less than 0.5 meters and accuracy hasn't improved by 20%, skip the update
        if (distance < 0.5 && locationAccuracy && (accuracy > locationAccuracy * 0.8)) {
          console.log("Skipping redundant location update (distance < 0.5m)");
          return;
        }
      }
      
      // Clear existing timeout if there is one
      if (debouncedLocationUpdateRef.current) {
        clearTimeout(debouncedLocationUpdateRef.current);
      }
      
      // Shorter debounce time for higher responsiveness
      debouncedLocationUpdateRef.current = setTimeout(() => {
        try {
          console.log("Updating location with high precision:", lat, lng, accuracy);
          
          // Improved accuracy validation - reject unreasonable values
          if (accuracy > 1000000) {
            console.warn("Rejecting location with unreasonable accuracy:", accuracy);
            // Try to get a better location fix
            requestHighAccuracyLocation();
            return;
          }
          
          setUserLocation([lat, lng]);
          setLocationAccuracy(accuracy);
          previousLocationRef.current = [lat, lng];
          
          // Only show toast if location accuracy has changed significantly 
          // or if it's the first update
          if (!locationInitializedRef.current) {
            toast({
              title: "Location Detected",
              description: `Your location has been detected with accuracy of ±${accuracy < 1 ? accuracy.toFixed(2) : accuracy.toFixed(1)}m`,
            });
            locationInitializedRef.current = true;
          } else if (highAccuracyModeRef.current) {
            // Show toast for high precision mode
            if (accuracy < 100) {
              toast({
                title: "High Precision Active",
                description: `Location tracking at ±${accuracy < 1 ? accuracy.toFixed(2) : accuracy.toFixed(1)}m precision`,
              });
              highAccuracyModeRef.current = false;
              
              // Dispatch event to update map with high precision
              document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
            } else {
              // Keep trying for better accuracy
              console.log("Still waiting for higher accuracy:", accuracy);
              requestHighAccuracyLocation();
            }
          }
          
          // Dispatch event for map and other components to use
          document.dispatchEvent(new CustomEvent('userLocationUpdated', {
            detail: { lat, lng, accuracy }
          }));
          
          // Reset error count on successful update
          errorCountRef.current = 0;
        } catch (error) {
          console.error("Error updating location state:", error);
          errorCountRef.current++;
        }
      }, 200); // Reduced debounce time to 200ms for faster updates
    } catch (error) {
      console.error("Error in handleLocationUpdate:", error);
      errorCountRef.current++;
    }
  }, [toast, locationAccuracy]);

  // Function to request high accuracy location
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
      
      // Update position options for maximum accuracy
      positionOptions.current = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };
      
      // First get a single position fix
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log("High accuracy position received:", latitude, longitude, accuracy);
          
          handleLocationUpdate(latitude, longitude, accuracy);
          
          // Start watching with maximum precision
          watchIdRef.current = navigator.geolocation.watchPosition(
            (watchPosition) => {
              const { latitude, longitude, accuracy } = watchPosition.coords;
              
              // Only process updates with reasonable accuracy
              if (accuracy < 1000000) {
                handleLocationUpdate(latitude, longitude, accuracy);
              } else {
                console.warn("Received position with very poor accuracy:", accuracy);
              }
            },
            (error) => {
              console.warn("Watch position error:", error);
              
              // If permission denied, show appropriate message
              if (error.code === 1) { // PERMISSION_DENIED
                toast({
                  title: "Location Access Required",
                  description: "Please enable location services to use high-precision tracking.",
                  variant: "destructive"
                });
              }
              
              // Try a fallback approach
              fallbackToRegularAccuracy();
            },
            positionOptions.current
          );
        },
        (error) => {
          console.error("High accuracy position error:", error);
          // Fall back to regular accuracy
          fallbackToRegularAccuracy();
        },
        positionOptions.current
      );
    }
  }, [handleLocationUpdate, toast]);
  
  // Fallback to regular accuracy if high accuracy fails
  const fallbackToRegularAccuracy = useCallback(() => {
    if (navigator.geolocation) {
      positionOptions.current = {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 30000
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          handleLocationUpdate(latitude, longitude, accuracy);
        },
        (error) => {
          console.error("Regular accuracy position error:", error);
          
          // Set a default location if all attempts fail
          setUserLocation([37.0902, -95.7129]);
          setLocationAccuracy(5000); // Large accuracy radius for default location
          locationInitializedRef.current = true;
          
          toast({
            title: "Location Detection Failed",
            description: "Using default location. Please enable location services for accurate information.",
            variant: "destructive"
          });
        },
        positionOptions.current
      );
    }
  }, [handleLocationUpdate, toast]);

  // Listen for location updates from the map component
  useEffect(() => {
    const handleUserLocationUpdate = (e: CustomEvent) => {
      try {
        console.log("User location update event received:", e.detail);
        const { lat, lng, accuracy } = e.detail;
        handleLocationUpdate(lat, lng, accuracy);
      } catch (error) {
        console.error("Error handling location update event:", error);
        errorCountRef.current++;
      }
    };

    document.addEventListener('userLocationUpdated', handleUserLocationUpdate as EventListener);
    
    return () => {
      document.removeEventListener('userLocationUpdated', handleUserLocationUpdate as EventListener);
      if (debouncedLocationUpdateRef.current) {
        clearTimeout(debouncedLocationUpdateRef.current);
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [handleLocationUpdate]);

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
    // Skip if we already have a location
    if (locationInitializedRef.current) return;
    
    try {
      requestHighAccuracyLocation();
    } catch (error) {
      console.error("Error initializing location:", error);
      // Set a default location on error
      setUserLocation([37.0902, -95.7129]);
      setLocationAccuracy(5000);
      locationInitializedRef.current = true;
    }
    
    // Return cleanup function
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [requestHighAccuracyLocation]);

  return {
    userLocation,
    locationAccuracy,
    setUserLocation,
    setLocationAccuracy
  };
};

export default useUserLocation;
