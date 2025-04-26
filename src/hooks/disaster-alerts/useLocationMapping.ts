
import { useCallback } from 'react';

export const useLocationMapping = () => {
  const getUserCountry = useCallback((location: [number, number] | null): string | undefined => {
    if (!location) return undefined;
    
    const [lat, lng] = location;
    
    // Nigeria (rough boundaries)
    if (lat > 4 && lat < 14 && lng > 2 && lng < 15) {
      return 'Nigeria';
    }
    
    // U.S. (rough boundaries)
    if (lat > 24 && lat < 50 && lng > -125 && lng < -66) {
      return 'United States of America';
    }
    
    return undefined;
  }, []);

  return { getUserCountry };
};
