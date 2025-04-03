
import { useState, useEffect, useCallback, useRef } from 'react';
import { ThreatMarker } from '@/types/threats';
import { threatService } from '@/services/threatService';
import { crimeService } from '@/services/crimeService';
import { hibpService } from '@/services/hibpService';
import { useToast } from '@/hooks/use-toast';

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
      
      const basicThreats = await threatService.getGlobalThreatMarkers(userLocation || undefined);
      allThreats = [...allThreats, ...basicThreats];
      
      if (userLocation) {
        try {
          const state = 'CA';
          const county = 'Los Angeles';
          
          const crimeThreats = await crimeService.getCrimeThreats(state, county);
          
          const crimeThreatsNearUser = crimeThreats.map(threat => ({
            ...threat,
            position: [
              userLocation[0] + (Math.random() * 0.02 - 0.01), 
              userLocation[1] + (Math.random() * 0.02 - 0.01)
            ] as [number, number]
          }));
          
          allThreats = [...allThreats, ...crimeThreatsNearUser];
        } catch (error) {
          console.error('Error loading crime data:', error);
        }
      }
      
      try {
        const cyberThreats = await hibpService.getBreachThreats('demo@example.com');
        
        if (userLocation) {
          const cyberThreatsNearUser = cyberThreats.map(threat => ({
            ...threat,
            position: [
              userLocation[0] + (Math.random() * 0.05 - 0.025), 
              userLocation[1] + (Math.random() * 0.05 - 0.025)
            ] as [number, number]
          }));
          allThreats = [...allThreats, ...cyberThreatsNearUser];
        } else {
          allThreats = [...allThreats, ...cyberThreats];
        }
      } catch (error) {
        console.error('Error loading cyber threat data:', error);
        
        // Add fallback cyber threats if API fails
        if (userLocation) {
          allThreats.push({
            id: 'cyber-fallback-1',
            position: [
              userLocation[0] + (Math.random() * 0.05 - 0.025), 
              userLocation[1] + (Math.random() * 0.05 - 0.025)
            ] as [number, number],
            level: 'high',
            title: 'Data Breach Alert',
            details: 'Detected compromise of user credentials in a recent breach. Advising password change.',
            type: 'cyber'
          });
        }
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
            position: [userLocation[0] + 0.1, userLocation[1] - 0.1],
            level: 'high',
            title: 'Data Breach Alert',
            details: 'Major data breach reported in this area affecting financial institutions.',
            type: 'cyber'
          },
          {
            id: '2',
            position: [userLocation[0] - 0.05, userLocation[1] + 0.05],
            level: 'medium',
            title: 'Street Crime Warning',
            details: 'Recent increase in street theft and muggings reported in this neighborhood.',
            type: 'physical'
          },
          {
            id: '3',
            position: [userLocation[0], userLocation[1] + 0.2],
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
