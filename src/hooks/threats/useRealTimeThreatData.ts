import { threatService } from '@/services/threatService';
import { ThreatMarker } from '@/types/threats';

export const useRealTimeThreatData = () => {
  const fetchRealTimeThreats = async (userLocation?: [number, number] | null): Promise<ThreatMarker[]> => {
    try {
      // Get threat data from the threat service
      const basicThreats = await threatService.getGlobalThreatMarkers(
        userLocation || undefined
      );
      
      // Filter out high-risk threats that are far from the user's location
      // to avoid showing alarming notifications for distant events
      const filteredThreats = basicThreats.filter(threat => {
        // Keep all low and medium threats
        if (threat.level !== 'high') return true;
        
        // For high threats, only keep them if they're close to the user
        if (userLocation) {
          const distance = calculateDistance(
            userLocation[0], userLocation[1],
            threat.position[0], threat.position[1]
          );
          
          // Only keep high threats within ~10km
          return distance < 0.1;
        }
        
        // By default, don't show high threats when no location
        return false;
      });
      
      return filteredThreats;
    } catch (error) {
      console.error('Error fetching real-time threats:', error);
      return [];
    }
  };
  
  // Calculate approximate distance between coordinates (in degrees)
  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    return Math.sqrt(
      Math.pow(lat1 - lat2, 2) + 
      Math.pow(lon1 - lon2, 2)
    );
  };

  return { fetchRealTimeThreats };
};
