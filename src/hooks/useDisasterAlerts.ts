import { useState, useEffect, useCallback } from 'react';
import { DisasterAlert } from '@/types/disasters';
import reliefWebService from '@/services/reliefWebService';
import { useLocationMapping } from './disaster-alerts/useLocationMapping';
import { useSampleAlerts } from './disaster-alerts/useSampleAlerts';
import { useAlertChecker } from './disaster-alerts/useAlertChecker';
import { useAlertLocalization } from './disaster-alerts/useAlertLocalization';

export const useDisasterAlerts = (userLocation: [number, number] | null) => {
  const [disasterAlerts, setDisasterAlerts] = useState<DisasterAlert[]>([]);
  const { getUserCountry } = useLocationMapping();
  const { getSampleDisasters } = useSampleAlerts();
  const { checkForNewAlerts } = useAlertChecker(userLocation);
  const { localizeAlerts } = useAlertLocalization();
  
  const loadDisasterAlerts = useCallback(async (forceRefresh = false) => {
    try {
      const userCountry = getUserCountry(userLocation);
      const apiAlerts = await reliefWebService.fetchDisasterAlerts(userCountry);
      
      if (apiAlerts.length > 0) {
        setDisasterAlerts(apiAlerts);
        return apiAlerts;
      }
      
      const sampleDisasters = getSampleDisasters();
      let alerts = sampleDisasters;
      
      if (userLocation) {
        alerts = localizeAlerts(sampleDisasters, userLocation);
      }
      
      setDisasterAlerts(alerts);
      return alerts;
    } catch (error) {
      console.error('Error loading disaster alerts:', error);
      return [];
    }
  }, [userLocation, getUserCountry, getSampleDisasters, localizeAlerts]);
  
  useEffect(() => {
    loadDisasterAlerts();
  }, [loadDisasterAlerts]);
  
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const userCountry = getUserCountry(userLocation);
      checkForNewAlerts(userCountry).then(hasNewAlerts => {
        if (hasNewAlerts) {
          loadDisasterAlerts(true);
        }
      });
    }, 3600000); // Check every hour
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [checkForNewAlerts, getUserCountry, userLocation, loadDisasterAlerts]);
  
  return {
    disasterAlerts,
    loadDisasterAlerts,
    checkForNewAlerts: async () => {
      const userCountry = getUserCountry(userLocation);
      const hasNewAlerts = await checkForNewAlerts(userCountry);
      if (hasNewAlerts) {
        await loadDisasterAlerts(true);
      }
      return hasNewAlerts;
    }
  };
};

export default useDisasterAlerts;
