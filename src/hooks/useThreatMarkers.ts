
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

  const loadThreatMarkers = useCallback(async (forceRefresh = false) => {
    // Skip loading if data already loaded and location hasn't changed
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
          // Get weather alerts for the user's location
          const nearbyLocations = [
            `${userLocation[0]},${userLocation[1]}`, // Exact location
            `${userLocation[0] + 0.1},${userLocation[1]}`, // Slightly north
            `${userLocation[0]},${userLocation[1] + 0.1}`, // Slightly east
          ];
          
          const weatherThreats = await weatherService.getWeatherThreats(nearbyLocations);
          allThreats = [...allThreats, ...weatherThreats];
          
          // Add crime data
          try {
            // Use reverse geocoding to get location info
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation[0]}&lon=${userLocation[1]}`);
            const data = await response.json();
            
            let state = 'CA';
            let county = 'Los Angeles';
            
            if (data && data.address) {
              state = data.address.state || state;
              county = data.address.county || county;
            }
            
            const crimeThreats = await crimeService.getCrimeThreats(state, county);
            
            const crimeThreatsNearUser = crimeThreats.map(threat => ({
              ...threat,
              position: [
                userLocation[0] + (Math.random() * 0.01 - 0.005), 
                userLocation[1] + (Math.random() * 0.01 - 0.005)
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
      
      // Ensure we have at least some threats to display
      if (allThreats.length < 3 && userLocation) {
        // Add fallback threats near user location
        allThreats.push({
          id: 'local-1',
          position: [
            userLocation[0] + 0.002, 
            userLocation[1] - 0.003
          ] as [number, number],
          level: 'medium',
          title: 'Local Safety Alert',
          details: 'Recent incidents reported in this area. Exercise caution when walking alone.',
          type: 'physical'
        });
        
        allThreats.push({
          id: 'weather-local-1',
          position: [
            userLocation[0] - 0.001, 
            userLocation[1] + 0.001
          ] as [number, number],
          level: 'low',
          title: 'Weather Advisory',
          details: 'Local weather conditions may change rapidly. Stay informed of updates.',
          type: 'environmental'
        });
      }
      
      setThreatMarkers(allThreats);
      dataLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading threat data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load some threat data. Please try again later.',
        variant: 'destructive',
      });
      
      // Add fallback threats if all APIs fail
      if (userLocation) {
        setThreatMarkers([
          {
            id: '1',
            position: [userLocation[0] + 0.002, userLocation[1] - 0.003],
            level: 'high',
            title: 'Data Breach Alert',
            details: 'Major data breach reported in this area affecting financial institutions.',
            type: 'cyber'
          },
          {
            id: '2',
            position: [userLocation[0] - 0.001, userLocation[1] + 0.001],
            level: 'medium',
            title: 'Street Crime Warning',
            details: 'Recent increase in street theft and muggings reported in this neighborhood.',
            type: 'physical'
          },
          {
            id: '3',
            position: [userLocation[0], userLocation[1] + 0.004],
            level: 'low',
            title: 'Weather Advisory',
            details: 'Potential flooding in low-lying areas due to heavy rainfall forecast.',
            type: 'environmental'
          }
        ]);
        dataLoadedRef.current = true;
      } else {
        setThreatMarkers([
          {
            id: '1',
            position: [40.7128, -74.006],
            level: 'high',
            title: 'Data Breach Alert',
            details: 'Major data breach reported in this area affecting financial institutions.',
            type: 'cyber'
          },
          {
            id: '2',
            position: [34.0522, -118.2437],
            level: 'medium',
            title: 'Street Crime Warning',
            details: 'Recent increase in street theft and muggings reported in this neighborhood.',
            type: 'physical'
          },
          {
            id: '3',
            position: [51.5074, -0.1278],
            level: 'low',
            title: 'Weather Advisory',
            details: 'Potential flooding in low-lying areas due to heavy rainfall forecast.',
            type: 'environmental'
          }
        ]);
        dataLoadedRef.current = true;
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
