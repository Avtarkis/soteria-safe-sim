
import { useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { GeoLocationHandler } from '@/components/ui/leaflet/utils/location/GeoLocationHandler';

export function useGeolocationWatch(
  onLocationUpdate: (lat: number, lng: number, accuracy: number) => void
) {
  const { toast } = useToast();
  const handlerRef = useRef<GeoLocationHandler | null>(null);
  const errorCountRef = useRef<number>(0);
  const highAccuracyModeRef = useRef<boolean>(false);
  
  // Create handler on first render
  useEffect(() => {
    handlerRef.current = new GeoLocationHandler(
      // Success callback
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        onLocationUpdate(latitude, longitude, accuracy);
        errorCountRef.current = 0;
      },
      // Error callback
      (error) => {
        console.warn("Position error:", error);
        errorCountRef.current++;
        
        if (errorCountRef.current > 3) {
          toast({
            title: "Location Issue",
            description: "Having trouble getting your precise location.",
            variant: "destructive"
          });
        }
      }
    );
    
    return () => {
      if (handlerRef.current) {
        // Clean up by stopping any active watches
        stopLocationWatch();
      }
    };
  }, [toast, onLocationUpdate]);

  // Start watching location with high accuracy
  const startHighAccuracyWatch = useCallback(() => {
    if (!handlerRef.current) return;
    
    highAccuracyModeRef.current = true;
    handlerRef.current.startWatch(true);
    
    console.log("Started high-accuracy location watch");
  }, []);

  // Start watching with standard accuracy (fallback)
  const startStandardWatch = useCallback(() => {
    if (!handlerRef.current) return;
    
    highAccuracyModeRef.current = false;
    handlerRef.current.startWatch(false);
    
    console.log("Started standard-accuracy location watch");
  }, []);

  // Cleanup function
  const stopLocationWatch = useCallback(() => {
    if (handlerRef.current) {
      handlerRef.current.stopWatch();
      console.log("Stopped location watch");
    }
  }, []);

  // Use a specific location (for testing or default fallback)
  const useDefaultLocation = useCallback((lat: number = 37.0902, lng: number = -95.7129, accuracy: number = 5000) => {
    onLocationUpdate(lat, lng, accuracy);
    
    toast({
      title: "Using Default Location",
      description: "Could not detect your actual location.",
      variant: "destructive"
    });
  }, [onLocationUpdate, toast]);

  return {
    startHighAccuracyWatch,
    startStandardWatch,
    stopLocationWatch,
    useDefaultLocation,
    isHighAccuracyMode: () => highAccuracyModeRef.current
  };
}
