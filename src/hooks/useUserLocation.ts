
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocationState } from './location/useLocationState';
import { useGeolocationWatch } from './location/useGeolocationWatch';
import { useLocationUpdater } from './location/useLocationUpdater';
import { useInitialLocation } from './location/useInitialLocation';
import { useToast } from './use-toast';

export const useUserLocation = () => {
  const { userLocation, setUserLocation, locationAccuracy, setLocationAccuracy } = useLocationState();
  const { toast } = useToast();
  
  // Add throttling refs
  const lastUpdateTimeRef = useRef<number>(0);
  const updateIntervalRef = useRef<number>(3000); // 3 seconds between updates
  const isHighPrecisionModeRef = useRef<boolean>(false);
  
  // Create location updater
  const {
    handleLocationUpdate,
    setHighAccuracyMode,
    isInitialized,
    cleanup
  } = useLocationUpdater(
    // Wrap setUserLocation with throttling
    (location) => {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current > updateIntervalRef.current) {
        setUserLocation(location);
        lastUpdateTimeRef.current = now;
      }
    }, 
    setLocationAccuracy
  );
  
  // Create geolocation watcher
  const {
    startHighAccuracyWatch,
    startStandardWatch,
    stopLocationWatch,
    useDefaultLocation
  } = useGeolocationWatch(handleLocationUpdate);
  
  // Initialize location tracking
  useInitialLocation({
    startHighAccuracyWatch,
    startStandardWatch,
    useDefaultLocation: () => useDefaultLocation(37.0902, -95.7129, 500)
  });
  
  // Listen for high precision mode activation - with throttling
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      if (isHighPrecisionModeRef.current) return; // Don't reactivate if already active
      
      console.log("High precision mode activated in useUserLocation");
      isHighPrecisionModeRef.current = true;
      setHighAccuracyMode(true);
      
      // Reduce the update interval for high precision mode
      updateIntervalRef.current = 2000; // 2 seconds for high precision mode
      
      startHighAccuracyWatch();
      
      toast({
        title: "Location Tracking",
        description: "Enhanced location precision activated.",
      });
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    // Automatically try high precision mode on mount - but only once and with a delay
    const initTimer = setTimeout(() => {
      if (!isInitialized() && !isHighPrecisionModeRef.current) {
        document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
      }
    }, 2000);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
      stopLocationWatch();
      cleanup();
      clearTimeout(initTimer);
    };
  }, [startHighAccuracyWatch, stopLocationWatch, toast, setHighAccuracyMode, isInitialized, cleanup]);
  
  return {
    userLocation,
    locationAccuracy,
    setUserLocation,
    setLocationAccuracy
  };
};

export default useUserLocation;
