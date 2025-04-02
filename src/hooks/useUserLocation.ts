
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for location updates from the map component
    const handleUserLocationUpdate = (e: CustomEvent) => {
      console.log("User location update event received:", e.detail);
      const { lat, lng, accuracy } = e.detail;
      setUserLocation([lat, lng]);
      setLocationAccuracy(accuracy);
      toast({
        title: "Location Updated",
        description: `Your location has been updated with accuracy of ±${accuracy.toFixed(1)}m`,
      });
    };

    document.addEventListener('userLocationUpdated', handleUserLocationUpdate as EventListener);
    
    return () => {
      document.removeEventListener('userLocationUpdated', handleUserLocationUpdate as EventListener);
    };
  }, [toast]);

  useEffect(() => {
    if (navigator.geolocation) {
      console.log("Getting user location via navigator.geolocation");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Position obtained:", position);
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          setLocationAccuracy(position.coords.accuracy);
          
          // Update real-time display by dispatching a custom event for the map
          const customEvent = new CustomEvent('userLocationUpdated', {
            detail: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          });
          document.dispatchEvent(customEvent);
          
          toast({
            title: "Location Detected",
            description: "Your current location has been detected and is now displayed on the map.",
          });
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
    }
  }, [toast]);

  return {
    userLocation,
    locationAccuracy,
    setUserLocation,
    setLocationAccuracy
  };
};

export default useUserLocation;
