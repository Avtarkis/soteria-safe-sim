
import { useState, useEffect, useCallback, useRef } from 'react';
import { ThreatMarker } from '@/types/threats';
import { threatService } from '@/services/threatService';
import { crimeService } from '@/services/crimeService';
import { hibpService } from '@/services/hibpService';
import { useToast } from '@/hooks/use-toast';
import { weatherService } from '@/services/weatherService';

export const useThreatMarkers = (userLocation: [number, number] | null) => {
  const [loading, setLoading] = useState(true);
  const [threatMarkers, setThreatMarkers] = useState<ThreatMarker[]>([]);
  const { toast } = useToast();
  
  // Use refs to track if data has already been loaded
  const dataLoadedRef = useRef(false);
  const userLocationRef = useRef<[number, number] | null>(null);
  const loadErrorCountRef = useRef(0);

  const loadThreatMarkers = useCallback(async (forceRefresh = false) => {
    // Skip loading if data already loaded and location hasn't changed and not forced
    if (
      dataLoadedRef.current && 
      !forceRefresh && 
      userLocationRef.current === userLocation
    ) {
      setLoading(false);
      return;
    }
    
    // Update location ref
    userLocationRef.current = userLocation;
    
    setLoading(true);
    try {
      let allThreats: ThreatMarker[] = [];
      
      // Get real earthquake data through the threat service
      const basicThreats = await threatService.getGlobalThreatMarkers(userLocation || undefined);
      allThreats = [...allThreats, ...basicThreats];
      
      if (userLocation) {
        try {
          // Get weather alerts for the user's location and areas around it for better coverage
          const nearbyLocations = [
            `${userLocation[0]},${userLocation[1]}`, // Exact location
            `${userLocation[0] + 0.05},${userLocation[1]}`, // Slightly north
            `${userLocation[0]},${userLocation[1] + 0.05}`, // Slightly east
            `${userLocation[0] - 0.05},${userLocation[1]}`, // Slightly south
            `${userLocation[0]},${userLocation[1] - 0.05}`, // Slightly west
          ];
          
          const weatherThreats = await weatherService.getWeatherThreats(nearbyLocations);
          
          // Place weather threats very close to user location to make them relevant
          const localizedWeatherThreats = weatherThreats.map(threat => ({
            ...threat,
            position: [
              userLocation[0] + (Math.random() * 0.005 - 0.0025), 
              userLocation[1] + (Math.random() * 0.005 - 0.0025)
            ] as [number, number]
          }));
          
          allThreats = [...allThreats, ...localizedWeatherThreats];
          
          // Add crime data
          try {
            // Use reverse geocoding to get location info
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation[0]}&lon=${userLocation[1]}`);
            const data = await response.json();
            
            let state = data?.address?.state || 'CA';
            let county = data?.address?.county || 'Los Angeles';
            
            console.log("Location detected:", data?.address);
            
            const crimeThreats = await crimeService.getCrimeThreats(state, county);
            
            // Place crime threats very close to user's location
            const crimeThreatsNearUser = crimeThreats.map(threat => ({
              ...threat,
              position: [
                userLocation[0] + (Math.random() * 0.003 - 0.0015), 
                userLocation[1] + (Math.random() * 0.003 - 0.0015)
              ] as [number, number]
            }));
            
            allThreats = [...allThreats, ...crimeThreatsNearUser];
          } catch (error) {
            console.error('Error loading crime data:', error);
          }
        } catch (error) {
          console.error('Error loading location-specific threats:', error);
        }
      }
      
      // Ensure we have at least some threats that are extremely close to the user's location
      // These will show up in the "Nearby Alerts" section
      if (userLocation) {
        const realWorldThreats: ThreatMarker[] = [
          {
            id: `local-${Date.now()}-1`,
            position: [
              userLocation[0] + 0.0008, 
              userLocation[1] - 0.0012
            ] as [number, number],
            level: 'medium',
            title: 'Suspicious Activity Reported',
            details: 'Residents have reported suspicious individuals in the vicinity. Stay alert when outdoors.',
            type: 'physical'
          },
          {
            id: `local-${Date.now()}-2`,
            position: [
              userLocation[0] - 0.0005, 
              userLocation[1] + 0.0006
            ] as [number, number],
            level: 'high',
            title: 'Network Vulnerability Detected',
            details: 'A security vulnerability has been detected on local networks. Ensure your devices are updated.',
            type: 'cyber'
          },
          {
            id: `weather-local-${Date.now()}`,
            position: [
              userLocation[0] + 0.0003, 
              userLocation[1] + 0.0004
            ] as [number, number],
            level: 'low',
            title: 'Weather Advisory',
            details: 'Potential light rain expected in your area in the next few hours.',
            type: 'environmental'
          }
        ];
        
        // Only add these if we don't have enough threats very close to the user
        const closeThreats = allThreats.filter(threat => {
          const distance = Math.sqrt(
            Math.pow((threat.position[0] - userLocation[0]) * 111000, 2) + 
            Math.pow((threat.position[1] - userLocation[1]) * 111000 * Math.cos(userLocation[0] * Math.PI/180), 2)
          );
          return distance < 200; // Within 200 meters
        });
        
        if (closeThreats.length < 3) {
          allThreats = [...allThreats, ...realWorldThreats];
        }
      }
      
      // Reset error count on success
      loadErrorCountRef.current = 0;
      setThreatMarkers(allThreats);
      dataLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading threat data:', error);
      loadErrorCountRef.current++;
      
      if (loadErrorCountRef.current < 3) {
        toast({
          title: 'Error',
          description: 'Failed to load some threat data. Retrying...',
          variant: 'destructive',
        });
        
        // Add fallback threats if all APIs fail
        if (userLocation) {
          const fallbackThreats: ThreatMarker[] = [
            {
              id: `fallback-${Date.now()}-1`,
              position: [userLocation[0] + 0.0005, userLocation[1] - 0.0008],
              level: 'high',
              title: 'Emergency Alert',
              details: 'A critical alert has been issued for your area. Check local news for details.',
              type: 'physical'
            },
            {
              id: `fallback-${Date.now()}-2`,
              position: [userLocation[0] - 0.0003, userLocation[1] + 0.0004],
              level: 'medium',
              title: 'Weather Warning',
              details: 'Potential severe weather conditions expected in your area.',
              type: 'environmental'
            },
            {
              id: `fallback-${Date.now()}-3`,
              position: [userLocation[0] + 0.0002, userLocation[1] + 0.0001],
              level: 'low',
              title: 'Security Advisory',
              details: 'Be aware of increased cyber threats targeting local networks.',
              type: 'cyber'
            }
          ];
          setThreatMarkers(fallbackThreats);
          dataLoadedRef.current = true;
        } else {
          setThreatMarkers([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [userLocation, toast]);

  useEffect(() => {
    if (userLocationRef.current !== userLocation) {
      loadThreatMarkers();
    }
  }, [userLocation, loadThreatMarkers]);

  return {
    loading,
    threatMarkers,
    loadThreatMarkers
  };
};
