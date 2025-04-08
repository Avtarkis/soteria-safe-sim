
import { calculateDistanceInMeters } from './geoUtils';

/**
 * Determines the safety level based on nearby threats
 */
export const determineSafetyLevel = (
  userLocation: [number, number], 
  threats: any[] = []
): 'safe' | 'caution' | 'danger' => {
  if (!userLocation || threats.length === 0) return 'safe';
  
  // Calculate distances to nearby threats
  const nearbyThreats = threats.filter(threat => {
    // Skip if threat doesn't have position
    if (!threat.position) return false;
    
    // Calculate rough distance in meters
    const distance = calculateDistanceInMeters(
      userLocation[0], userLocation[1],
      threat.position[0], threat.position[1]
    );
    
    // Consider threats within 2km
    return distance < 2000;
  });
  
  // Count threats by severity
  const highLevelThreats = nearbyThreats.filter(t => t.level === 'high').length;
  const mediumLevelThreats = nearbyThreats.filter(t => t.level === 'medium').length;
  
  // Determine safety level
  if (highLevelThreats > 0) return 'danger';
  if (mediumLevelThreats > 0) return 'caution';
  return 'safe';
};
