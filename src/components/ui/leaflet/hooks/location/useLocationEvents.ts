
import { useCallback } from 'react';
import { ThreatMarker } from '@/types/threats';

/**
 * Determine safety level based on proximity to threats
 */
export function determineSafetyLevel(
  latitude: number, 
  longitude: number, 
  threatMarkers: ThreatMarker[]
): 'safe' | 'caution' | 'danger' {
  if (!threatMarkers.length) return 'safe';
  
  // Calculate distances to all threats
  const distances = threatMarkers.map(threat => {
    const [threatLat, threatLng] = threat.position;
    // Simple distance calculation (not accounting for Earth's curvature)
    return Math.sqrt(
      Math.pow(latitude - threatLat, 2) + 
      Math.pow(longitude - threatLng, 2)
    );
  });
  
  // Find the minimum distance
  const minDistance = Math.min(...distances);
  
  // Determine safety level based on proximity
  if (minDistance < 0.01) return 'danger';     // Within ~1km
  if (minDistance < 0.05) return 'caution';    // Within ~5km
  return 'safe';
}

/**
 * Hook to handle location events
 */
export function useLocationEvents(threatMarkers: ThreatMarker[] = []) {
  // Calculate safety level based on location
  const getSafetyLevel = useCallback((latitude: number, longitude: number) => {
    return determineSafetyLevel(latitude, longitude, threatMarkers);
  }, [threatMarkers]);
  
  return {
    getSafetyLevel
  };
}

export default useLocationEvents;
