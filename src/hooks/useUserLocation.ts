
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

  // Create a stable callback for location updates
  const handleLocationUpdate = useCallback((lat: number, lng: number, accuracy: number) => {
    // Clear existing timeout if there is one
    if (debouncedLocationUpdateRef.current) {
      clearTimeout(debouncedLocationUpdateRef.current);
    }
    
    // Debounce location updates to reduce unnecessary state changes
    debouncedLocationUpdateRef.current = setTimeout(() => {
      setUserLocation([lat, lng]);
      setLocationAccuracy(accuracy);
      
      // Only show toast if location accuracy has changed significantly 
      // or if it's the first update
      if (!locationInitializedRef.current) {
        toast({
          title: "Location Detected",
          description: `Your location has been detected with accuracy of ±${accuracy.toFixed(1)}m`,
        });
        locationInitializedRef.current = true;
      }
    }, 300);
  }, [toast]);

  // Listen for location updates from the map component
  useEffect(() => {
    const handleUserLocationUpdate = (e: CustomEvent) => {
      console.log("User location update event received:", e.detail);
      const { lat, lng, accuracy } = e.detail;
      handleLocationUpdate(lat, lng, accuracy);
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

  // Initial location detection
  useEffect(() => {
    // Skip if we already have a location
    if (locationInitializedRef.current) return;
    
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
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
  }, [toast, handleLocationUpdate]);

  return {
    userLocation,
    locationAccuracy,
    setUserLocation,
    setLocationAccuracy
  };
};

export default useUserLocation;
