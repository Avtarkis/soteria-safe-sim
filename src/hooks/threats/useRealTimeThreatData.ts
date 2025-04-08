
import { useCallback } from 'react';
import { ThreatMarker } from '@/types/threats';

export const useRealTimeThreatData = () => {
  // Fetch real-time threats from various APIs
  const fetchRealTimeThreats = useCallback(async (userLocation: [number, number] | null): Promise<ThreatMarker[]> => {
    try {
      // Generate a few reasonable threats in the area
      // For a real app, this would integrate with actual threat APIs
      const threats: ThreatMarker[] = [];
      
      if (!userLocation) {
        return threats;
      }
      
      // Add some physical threats 
      const numPhysicalThreats = Math.floor(Math.random() * 2); // 0-1 physical threats
      for (let i = 0; i < numPhysicalThreats; i++) {
        // Calculate random position within 0.01-0.05 degrees of user (roughly 1-5km)
        const latOffset = (Math.random() * 0.04 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
        const lngOffset = (Math.random() * 0.04 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
        
        const threatLat = userLocation[0] + latOffset;
        const threatLng = userLocation[1] + lngOffset;
        
        threats.push({
          id: `physical-${Date.now()}-${i}`,
          position: [threatLat, threatLng],
          level: Math.random() > 0.8 ? 'medium' : 'low', // Mostly low risk
          title: 'Minor Incident Report',
          details: 'A minor incident has been reported in this area. Exercise normal caution.',
          type: 'physical'
        });
      }
      
      // Add cyber threats
      const numCyberThreats = Math.floor(Math.random() * 2); // 0-1 cyber threats
      for (let i = 0; i < numCyberThreats; i++) {
        // Place cyber threats a bit further away
        const latOffset = (Math.random() * 0.08 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
        const lngOffset = (Math.random() * 0.08 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
        
        const threatLat = userLocation[0] + latOffset;
        const threatLng = userLocation[1] + lngOffset;
        
        threats.push({
          id: `cyber-${Date.now()}-${i}`,
          position: [threatLat, threatLng],
          level: 'low', // Always low risk for cyber
          title: 'Unsecured WiFi Network',
          details: 'An unsecured public WiFi network has been detected in this area. Be cautious when connecting.',
          type: 'cyber'
        });
      }
      
      // Add environmental threats
      const numEnvThreats = Math.floor(Math.random() * 2); // 0-1 environmental threats
      for (let i = 0; i < numEnvThreats; i++) {
        // Environmental threats can be closer or further
        const latOffset = (Math.random() * 0.06 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
        const lngOffset = (Math.random() * 0.06 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
        
        const threatLat = userLocation[0] + latOffset;
        const threatLng = userLocation[1] + lngOffset;
        
        threats.push({
          id: `env-${Date.now()}-${i}`,
          position: [threatLat, threatLng],
          level: Math.random() > 0.7 ? 'medium' : 'low', // Mostly low risk
          title: 'Weather Advisory',
          details: 'A weather advisory has been issued for this area. Check local forecasts for updates.',
          type: 'environmental'
        });
      }
      
      return threats;
    } catch (error) {
      console.error('Error fetching real-time threats:', error);
      return [];
    }
  }, []);

  return {
    fetchRealTimeThreats
  };
};
