
import { useState } from 'react';

/**
 * Hook to manage location state
 */
export function useLocationState() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

  return {
    userLocation,
    setUserLocation,
    locationAccuracy,
    setLocationAccuracy
  };
}
