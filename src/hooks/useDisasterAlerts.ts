
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DisasterAlert } from '@/types/disasters';

export const useDisasterAlerts = (userLocation: [number, number] | null) => {
  const [disasterAlerts, setDisasterAlerts] = useState<DisasterAlert[]>([]);
  const { toast } = useToast();

  // Generate a random disaster alert for demo purposes
  const generateRandomAlert = useCallback((userLocation: [number, number]): DisasterAlert => {
    const alertTypes = ['earthquake', 'wildfire', 'flood', 'storm', 'extreme_heat'];
    const alertSeverities = ['advisory', 'watch', 'warning'];
    
    // Get pseudorandom time within the last 24 hours
    const hours = Math.floor(Math.random() * 24);
    const mins = Math.floor(Math.random() * 60);
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - hours);
    timestamp.setMinutes(timestamp.getMinutes() - mins);
    
    const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const randomSeverity = alertSeverities[Math.floor(Math.random() * alertSeverities.length)];
    
    // Create alert titles based on type and severity
    let title = '';
    switch (randomType) {
      case 'earthquake':
        const magnitude = (2 + Math.random() * 3.5).toFixed(1);
        title = `M${magnitude} Earthquake`;
        break;
      case 'wildfire':
        title = `${randomSeverity === 'warning' ? 'Active' : 'Potential'} Wildfire`;
        break;
      case 'flood':
        title = `${randomSeverity.charAt(0).toUpperCase() + randomSeverity.slice(1)} Flood`;
        break;
      case 'storm':
        const stormTypes = ['Thunderstorm', 'Lightning', 'High Winds', 'Heavy Rain'];
        const randomStorm = stormTypes[Math.floor(Math.random() * stormTypes.length)];
        title = randomStorm;
        break;
      case 'extreme_heat':
        title = 'Extreme Heat';
        break;
      default:
        title = 'Weather Alert';
    }
    
    return {
      id: Math.random().toString(36).substring(2, 15),
      title,
      type: randomType as any,
      severity: randomSeverity as any,
      location: {
        latitude: userLocation[0] + (Math.random() * 0.05 - 0.025),
        longitude: userLocation[1] + (Math.random() * 0.05 - 0.025),
      },
      timestamp: timestamp.toISOString(),
      description: `${title} reported in your area. ${randomSeverity === 'warning' ? 'Take immediate precautions.' : randomSeverity === 'watch' ? 'Stay alert and monitor conditions.' : 'Be aware of changing conditions.'}`,
      source: 'Soteria Safety System'
    };
  }, []);

  // Load disaster alerts
  const loadDisasterAlerts = useCallback(async (forceRefresh = false) => {
    if (!userLocation) {
      setDisasterAlerts([]);
      return;
    }
    
    try {
      // For demo, create 1-2 random disaster alerts
      const numAlerts = Math.floor(Math.random() * 2) + 1;
      const alerts: DisasterAlert[] = [];
      
      for (let i = 0; i < numAlerts; i++) {
        alerts.push(generateRandomAlert(userLocation));
      }
      
      setDisasterAlerts(alerts);
    } catch (error) {
      console.error('Error loading disaster alerts:', error);
      toast({
        title: 'Error Loading Alerts',
        description: 'Could not load disaster alerts. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [userLocation, toast, generateRandomAlert]);

  // Load alerts when user location changes
  useEffect(() => {
    if (userLocation) {
      loadDisasterAlerts();
    }
  }, [userLocation, loadDisasterAlerts]);

  return {
    disasterAlerts,
    loadDisasterAlerts
  };
};

export default useDisasterAlerts;
