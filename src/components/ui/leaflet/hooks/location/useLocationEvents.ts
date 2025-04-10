
import { useCallback } from 'react';
import { ThreatMarker } from '@/types/threats';

/**
 * Hook to handle safety level assessment based on proximity to threats
 */
export function useLocationEvents(threatMarkers: ThreatMarker[] = []) {
  // Determine safety level based on proximity to threats
  const getSafetyLevel = useCallback((lat: number, lng: number): 'safe' | 'caution' | 'danger' => {
    if (!threatMarkers || threatMarkers.length === 0) {
      return 'safe';
    }
    
    try {
      // Calculate distances to all threats
      const distances = threatMarkers.map(threat => {
        const threatLat = threat.position[0];
        const threatLng = threat.position[1];
        
        // Haversine formula for distance calculation
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat * Math.PI/180;
        const φ2 = threatLat * Math.PI/180;
        const Δφ = (threatLat - lat) * Math.PI/180;
        const Δλ = (threatLng - lng) * Math.PI/180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return {
          distance,
          level: threat.level
        };
      });
      
      // Check for nearby threats
      const dangerThreshold = 500; // meters
      const cautionThreshold = 1500; // meters
      
      const nearbyDanger = distances.some(d => 
        d.distance < dangerThreshold && d.level === 'high'
      );
      
      const nearbyCaution = distances.some(d => 
        d.distance < cautionThreshold && (d.level === 'medium' || d.level === 'high')
      );
      
      if (nearbyDanger) return 'danger';
      if (nearbyCaution) return 'caution';
      return 'safe';
    } catch (error) {
      console.error("Error calculating safety level:", error);
      return 'safe'; // Default to safe on error
    }
  }, [threatMarkers]);
  
  return {
    getSafetyLevel
  };
}

export default useLocationEvents;
