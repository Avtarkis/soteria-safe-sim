
import { useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useLocationUpdater(
  setUserLocation: (location: [number, number]) => void,
  setLocationAccuracy: (accuracy: number) => void
) {
  const { toast } = useToast();
  const locationInitializedRef = useRef(false);
  const debouncedLocationUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const previousLocationRef = useRef<[number, number] | null>(null);
  const highAccuracyModeRef = useRef<boolean>(false);

  // Handle location update with debounce for performance
  const handleLocationUpdate = useCallback((lat: number, lng: number, accuracy: number) => {
    // Skip if the location hasn't changed significantly
    if (previousLocationRef.current) {
      const [prevLat, prevLng] = previousLocationRef.current;
      const distance = Math.sqrt(
        Math.pow((lat - prevLat) * 111000, 2) + 
        Math.pow((lng - prevLng) * 111000 * Math.cos(prevLat * Math.PI/180), 2)
      );
      
      // If the distance is less than 0.5 meters and accuracy hasn't improved by 10%, skip
      // Increased threshold for more reliable updates
      if (distance < 0.5 && accuracy > (previousLocationRef.current ? accuracy * 0.9 : Infinity)) {
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
      
      // Dispatch event for other components
      document.dispatchEvent(new CustomEvent('userLocationUpdated', {
        detail: { lat, lng, accuracy }
      }));
    }, 150);
  }, [setUserLocation, setLocationAccuracy, toast]);

  // Set high accuracy mode flag
  const setHighAccuracyMode = useCallback((isHighAccuracy: boolean) => {
    highAccuracyModeRef.current = isHighAccuracy;
  }, []);

  return {
    handleLocationUpdate,
    setHighAccuracyMode,
    isInitialized: () => locationInitializedRef.current,
    cleanup: () => {
      if (debouncedLocationUpdateRef.current) {
        clearTimeout(debouncedLocationUpdateRef.current);
      }
    }
  };
}
