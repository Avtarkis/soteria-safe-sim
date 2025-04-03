
import { useState, useEffect, useCallback, useRef } from 'react';
import { emergencyService } from '@/services/emergencyService';

export const useDisasterAlerts = (userLocation: [number, number] | null) => {
  const [disasterAlerts, setDisasterAlerts] = useState<any[]>([]);
  const disasterAlertsLoadedRef = useRef(false);
  const userLocationRef = useRef<[number, number] | null>(null);

  const loadDisasterAlerts = useCallback(async (forceRefresh = false) => {
    if (!userLocation || 
        (disasterAlertsLoadedRef.current && 
         !forceRefresh && 
         userLocationRef.current === userLocation)) return;
    
    userLocationRef.current = userLocation;
    
    try {
      const alerts = await emergencyService.getDisasterAlertsNearLocation(userLocation[0], userLocation[1]);
      setDisasterAlerts(alerts);
      disasterAlertsLoadedRef.current = true;
    } catch (err) {
      console.error("Failed to load disaster alerts:", err);
    }
  }, [userLocation]);

  useEffect(() => {
    if (userLocationRef.current !== userLocation) {
      loadDisasterAlerts();
    }
  }, [userLocation, loadDisasterAlerts]);

  return {
    disasterAlerts,
    loadDisasterAlerts
  };
};
