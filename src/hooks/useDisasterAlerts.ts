
import { useState, useEffect, useCallback } from 'react';
import { DisasterAlert } from '@/types/disasters.d';

export const useDisasterAlerts = (userLocation: [number, number] | null) => {
  const [disasterAlerts, setDisasterAlerts] = useState<DisasterAlert[]>([]);
  
  const loadDisasterAlerts = useCallback(async (forceRefresh = false) => {
    try {
      // For demo purposes, we'll generate some sample disaster alerts
      // In a real application, this would fetch from an API
      const sampleDisasters: DisasterAlert[] = [
        {
          id: '1',
          title: 'Flash Flood Warning',
          type: 'flood',
          severity: 'medium',
          location: 'Downtown Area',
          coordinates: [37.7749, -122.4194],
          description: 'Flash flooding possible in low-lying areas. Where every second counts, move to higher ground immediately.',
          date: new Date().toISOString(),
          source: 'National Weather Service',
          active: true
        },
        {
          id: '2',
          title: 'Wildfire Alert',
          type: 'fire',
          severity: 'high',
          location: 'North County',
          coordinates: [37.8044, -122.2712],
          description: 'Rapidly spreading wildfire. Evacuation orders in effect. Where every second counts, follow evacuation routes.',
          date: new Date().toISOString(),
          source: 'Emergency Management Agency',
          active: true
        },
        {
          id: '3',
          title: 'Earthquake Advisory',
          type: 'earthquake',
          severity: 'low',
          location: 'Regional',
          coordinates: [37.7858, -122.4064],
          description: 'Minor seismic activity detected. No immediate danger, but remain alert. Every second counts when preparing.',
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          source: 'Geological Survey',
          active: false
        }
      ];
      
      setDisasterAlerts(sampleDisasters);
      return sampleDisasters;
    } catch (error) {
      console.error('Error loading disaster alerts:', error);
      return [];
    }
  }, []);
  
  useEffect(() => {
    loadDisasterAlerts();
  }, [loadDisasterAlerts]);
  
  return {
    disasterAlerts,
    loadDisasterAlerts
  };
};

export default useDisasterAlerts;
