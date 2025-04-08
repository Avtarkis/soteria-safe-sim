
import { useState, useEffect, useCallback } from 'react';
import { DisasterAlert, DisasterAlertType, DisasterAlertSeverity } from '@/types/disasters.d';

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
          type: 'flood' as DisasterAlertType,
          severity: 'medium' as DisasterAlertSeverity,
          location: 'Downtown Area',
          coordinates: [37.7749, -122.4194] as [number, number],
          description: 'Flash flooding possible in low-lying areas. Where every second counts, move to higher ground immediately.',
          date: new Date().toISOString(),
          source: 'National Weather Service',
          active: true,
          country: 'United States',
          region: 'California'
        },
        {
          id: '2',
          title: 'Wildfire Alert',
          type: 'fire' as DisasterAlertType,
          severity: 'high' as DisasterAlertSeverity,
          location: 'North County',
          coordinates: [37.8044, -122.2712] as [number, number],
          description: 'Rapidly spreading wildfire. Evacuation orders in effect. Where every second counts, follow evacuation routes.',
          date: new Date().toISOString(),
          source: 'Emergency Management Agency',
          active: true,
          country: 'United States',
          region: 'California'
        },
        {
          id: '3',
          title: 'Earthquake Advisory',
          type: 'earthquake' as DisasterAlertType,
          severity: 'low' as DisasterAlertSeverity,
          location: 'Regional',
          coordinates: [37.7858, -122.4064] as [number, number],
          description: 'Minor seismic activity detected. No immediate danger, but remain alert. Every second counts when preparing.',
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          source: 'Geological Survey',
          active: false,
          country: 'United States',
          region: 'California'
        }
      ];
      
      // Localize alerts based on user location
      if (userLocation) {
        // This would normally use geocoding to determine location
        // For demo purposes, we'll just clone and modify the alerts
        const localizedAlerts = [...sampleDisasters];
        
        // Update locations based on rough coordinates
        if (userLocation[0] > 40 && userLocation[0] < 50 && userLocation[1] > -80 && userLocation[1] < -70) {
          // Northeast US
          localizedAlerts.forEach(alert => {
            alert.country = 'United States';
            alert.region = 'New York';
            alert.location = 'Northeast Region';
          });
        } else if (userLocation[0] > 30 && userLocation[0] < 40 && userLocation[1] > -100 && userLocation[1] < -90) {
          // South US
          localizedAlerts.forEach(alert => {
            alert.country = 'United States';
            alert.region = 'Texas';
            alert.location = 'Southern Region';
          });
        }
        
        setDisasterAlerts(localizedAlerts);
        return localizedAlerts;
      }
      
      setDisasterAlerts(sampleDisasters);
      return sampleDisasters;
    } catch (error) {
      console.error('Error loading disaster alerts:', error);
      return [];
    }
  }, [userLocation]);
  
  useEffect(() => {
    loadDisasterAlerts();
  }, [loadDisasterAlerts]);
  
  return {
    disasterAlerts,
    loadDisasterAlerts
  };
};

export default useDisasterAlerts;
