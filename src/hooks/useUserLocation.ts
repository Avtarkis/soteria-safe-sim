
import { useState, useEffect, useCallback } from 'react';
import { useLocationState } from './location/useLocationState';
import { useGeolocationWatch } from './location/useGeolocationWatch';
import { useLocationUpdater } from './location/useLocationUpdater';
import { useInitialLocation } from './location/useInitialLocation';
import { useToast } from './use-toast';

export const useUserLocation = () => {
  const { userLocation, setUserLocation, locationAccuracy, setLocationAccuracy } = useLocationState();
  const { toast } = useToast();
  
  // Create location updater
  const {
    handleLocationUpdate,
    setHighAccuracyMode,
    isInitialized,
    cleanup
  } = useLocationUpdater(setUserLocation, setLocationAccuracy);
  
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
  
  // Listen for high precision mode activation
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      console.log("High precision mode activated in useUserLocation");
      setHighAccuracyMode(true);
      startHighAccuracyWatch();
      
      toast({
        title: "High Precision Mode",
        description: "Activated enhanced location precision.",
      });
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    // Automatically try high precision mode on mount
    setTimeout(() => {
      if (!isInitialized()) {
        document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
      }
    }, 1000);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
      stopLocationWatch();
      cleanup();
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
