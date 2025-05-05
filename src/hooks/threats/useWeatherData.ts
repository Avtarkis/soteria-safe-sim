
import { useState, useEffect, useCallback } from 'react';
import { weatherService } from '@/services/weatherService';
import { ThreatMarker } from '@/types/threats';
import { DisasterAlert } from '@/types/disasters';

export const useWeatherData = (userLocation: [number, number] | null) => {
  const [weatherThreats, setWeatherThreats] = useState<ThreatMarker[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<DisasterAlert[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch weather threats based on user location
  const fetchWeatherThreats = useCallback(async () => {
    if (!userLocation) {
      return [];
    }

    setLoading(true);
    try {
      // Create locations for weather checks (current location + surrounding areas)
      const locations = [
        `${userLocation[0]},${userLocation[1]}`,
        `${userLocation[0] + 0.1},${userLocation[1]}`,
        `${userLocation[0]},${userLocation[1] + 0.1}`,
        `${userLocation[0] - 0.1},${userLocation[1]}`,
        `${userLocation[0]},${userLocation[1] - 0.1}`
      ];

      // Get weather threats
      const threats = await weatherService.getWeatherThreats(locations);
      setWeatherThreats(threats);
      
      // Get formatted weather alerts
      const alerts = await weatherService.transformWeatherAlertsToDisasterAlerts(`${userLocation[0]},${userLocation[1]}`);
      setWeatherAlerts(alerts);
      
      return {
        threats,
        alerts
      };
    } catch (error) {
      console.error('Error fetching weather threats:', error);
      return {
        threats: [],
        alerts: []
      };
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  // Initial fetch
  useEffect(() => {
    if (userLocation) {
      fetchWeatherThreats();
    }
  }, [userLocation, fetchWeatherThreats]);

  return {
    weatherThreats,
    weatherAlerts,
    loading,
    fetchWeatherThreats
  };
};

export default useWeatherData;
