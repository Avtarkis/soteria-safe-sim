
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Use a ref to track if location has been initialized to prevent unnecessary reloads
  const locationInitializedRef = useRef(false);
  
  // Use a debounced location update to prevent too many state updates
  const debouncedLocationUpdateRef = useRef<NodeJS.Timeout | null>(null);
  // Track the previous location to prevent redundant updates
  const previousLocationRef = useRef<[number, number] | null>(null);
  // Track error count
  const errorCountRef = useRef<number>(0);
  // Track high accuracy mode
  const highAccuracyModeRef = useRef<boolean>(false);

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
            toast({
              title: "High Precision Active",
              description: `Location tracking at ±${accuracy < 1 ? accuracy.toFixed(2) : accuracy.toFixed(1)}m precision`,
            });
            highAccuracyModeRef.current = false;
          }
          
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
      // Clear any pending timeouts
      if (debouncedLocationUpdateRef.current) {
        clearTimeout(debouncedLocationUpdateRef.current);
      }
    };
  }, [handleLocationUpdate]);

  // Listen for high precision mode activation
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      highAccuracyModeRef.current = true;
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    };
  }, []);

  // Initial location detection - only run once
  useEffect(() => {
    // Skip if we already have a location
    if (locationInitializedRef.current) return;
    
    try {
      if (navigator.geolocation) {
        console.log("Getting user location via navigator.geolocation with high accuracy");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("High-precision position obtained:", position);
            handleLocationUpdate(
              position.coords.latitude, 
              position.coords.longitude, 
              position.coords.accuracy
            );
            
            // Start watching for even more accurate location updates
            const watchId = navigator.geolocation.watchPosition(
              (watchPosition) => {
                // Compare new position with previous to see if it's more accurate
                if (watchPosition.coords.accuracy < position.coords.accuracy) {
                  handleLocationUpdate(
                    watchPosition.coords.latitude,
                    watchPosition.coords.longitude,
                    watchPosition.coords.accuracy
                  );
                }
              },
              (error) => {
                console.warn("Watch position error:", error);
              },
              {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
              }
            );
            
            // Clear watch after 30 seconds to save battery
            setTimeout(() => {
              navigator.geolocation.clearWatch(watchId);
            }, 30000);
          },
          (error) => {
            console.error('Error getting location:', error);
            toast({
              title: 'Location Error',
              description: 'Could not access your precise location. Using default view.',
              variant: 'destructive',
            });
            
            // Set a default location
            setUserLocation([37.0902, -95.7129]);
            locationInitializedRef.current = true;
          },
          { 
            enableHighAccuracy: true, 
            timeout: 30000, // Increased timeout for better accuracy
            maximumAge: 0 // Don't use cached positions for maximum accuracy
          }
        );
      } else {
        toast({
          title: 'Location Not Supported',
          description: 'Geolocation is not supported by this browser. Using default view.',
          variant: 'destructive',
        });
        setUserLocation([37.0902, -95.7129]);
        locationInitializedRef.current = true;
      }
    } catch (error) {
      console.error("Error initializing location:", error);
      // Set a default location on error
      setUserLocation([37.0902, -95.7129]);
      locationInitializedRef.current = true;
    }
  }, [toast, handleLocationUpdate]);

  return {
    userLocation,
    locationAccuracy,
    setUserLocation,
    setLocationAccuracy
  };
};

export default useUserLocation;
