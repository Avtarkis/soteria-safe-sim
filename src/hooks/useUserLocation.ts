
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleUserLocationUpdate = (e: CustomEvent) => {
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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          setLocationAccuracy(position.coords.accuracy);
          
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
          setUserLocation([37.0902, -95.7129]);
        }
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
