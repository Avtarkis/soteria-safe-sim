
import { useEffect, useRef } from 'react';

interface UseInitialLocationProps {
  startHighAccuracyWatch: () => void;
  startStandardWatch: () => void;
  useDefaultLocation: () => void;
}

export function useInitialLocation({
  startHighAccuracyWatch,
  startStandardWatch,
  useDefaultLocation
}: UseInitialLocationProps) {
  const initializedRef = useRef(false);

  // Try to get initial location once
  useEffect(() => {
    const attemptLocationInit = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      
      try {
        // First try high accuracy
        console.log("Attempting initial high-accuracy location");
        startHighAccuracyWatch();
        
        // Set a fallback timer in case high accuracy doesn't work
        const fallbackTimer = setTimeout(() => {
          console.log("Falling back to standard accuracy");
          startStandardWatch();
        }, 5000);
        
        // And a final fallback to default location
        const defaultLocationTimer = setTimeout(() => {
          useDefaultLocation();
        }, 15000);
        
        // Cleanup function
        return () => {
          clearTimeout(fallbackTimer);
          clearTimeout(defaultLocationTimer);
        };
      } catch (error) {
        console.error("Error in location initialization:", error);
        startStandardWatch();
      }
    };
    
    // Start location initialization with a small delay
    const initTimer = setTimeout(attemptLocationInit, 500);
    
    return () => {
      clearTimeout(initTimer);
    };
  }, [startHighAccuracyWatch, startStandardWatch, useDefaultLocation]);
}
