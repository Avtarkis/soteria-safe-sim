
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

  // Create a stable callback for location updates
  const handleLocationUpdate = useCallback((lat: number, lng: number, accuracy: number) => {
    try {
      // Skip if the location hasn't changed significantly (within 5 meters)
      if (previousLocationRef.current) {
        const [prevLat, prevLng] = previousLocationRef.current;
        const distance = Math.sqrt(
          Math.pow((lat - prevLat) * 111000, 2) + 
          Math.pow((lng - prevLng) * 111000 * Math.cos(prevLat * Math.PI/180), 2)
        );
        
        // If the distance is less than 5 meters and accuracy hasn't improved by 20%, skip the update
        if (distance < 5 && locationAccuracy && (accuracy > locationAccuracy * 0.8)) {
          console.log("Skipping redundant location update (distance < 5m)");
          return;
        }
      }
      
      // Clear existing timeout if there is one
      if (debouncedLocationUpdateRef.current) {
        clearTimeout(debouncedLocationUpdateRef.current);
      }
      
      // Debounce location updates to reduce unnecessary state changes
      debouncedLocationUpdateRef.current = setTimeout(() => {
        try {
          console.log("Updating location:", lat, lng, accuracy);
          setUserLocation([lat, lng]);
          setLocationAccuracy(accuracy);
          previousLocationRef.current = [lat, lng];
          
          // Only show toast if location accuracy has changed significantly 
          // or if it's the first update
          if (!locationInitializedRef.current) {
            toast({
              title: "Location Detected",
              description: `Your location has been detected with accuracy of ±${accuracy.toFixed(1)}m`,
            });
            locationInitializedRef.current = true;
          }
          // Reset error count on successful update
          errorCountRef.current = 0;
        } catch (error) {
          console.error("Error updating location state:", error);
          errorCountRef.current++;
        }
      }, 500); // Reduced debounce time to 500ms for faster updates
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

  // Initial location detection - only run once
  useEffect(() => {
    // Skip if we already have a location
    if (locationInitializedRef.current) return;
    
    try {
      if (navigator.geolocation) {
        console.log("Getting user location via navigator.geolocation");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Position obtained:", position);
            handleLocationUpdate(
              position.coords.latitude, 
              position.coords.longitude, 
              position.coords.accuracy
            );
          },
          (error) => {
            console.error('Error getting location:', error);
            toast({
              title: 'Location Error',
              description: 'Could not access your location. Using default view.',
              variant: 'destructive',
            });
            // Set a default location
            setUserLocation([37.0902, -95.7129]);
            locationInitializedRef.current = true;
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, // Increased timeout
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
