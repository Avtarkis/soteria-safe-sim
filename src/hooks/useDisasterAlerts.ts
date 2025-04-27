
import { useState, useEffect, useCallback } from 'react';
import { DisasterAlert } from '@/types/disasters';
import reliefWebService from '@/services/reliefWebService';
import { useToast } from '@/hooks/use-toast';
import { useLocationMapping } from './disaster-alerts/useLocationMapping';
import { useSampleAlerts } from './disaster-alerts/useSampleAlerts';
import { useAlertChecker } from './disaster-alerts/useAlertChecker';

export const useDisasterAlerts = (userLocation: [number, number] | null) => {
  const [disasterAlerts, setDisasterAlerts] = useState<DisasterAlert[]>([]);
  const { toast } = useToast();
  const { getUserCountry } = useLocationMapping();
  const { getSampleDisasters } = useSampleAlerts();
  const { checkForNewAlerts } = useAlertChecker(userLocation);
  
  const loadDisasterAlerts = useCallback(async (forceRefresh = false) => {
    try {
      const userCountry = getUserCountry(userLocation);
      const apiAlerts = await reliefWebService.fetchDisasterAlerts(userCountry);
      
      if (apiAlerts.length > 0) {
        setDisasterAlerts(apiAlerts);
        return apiAlerts;
      }
      
      const sampleDisasters = getSampleDisasters();
      
      if (userLocation) {
        const localizedAlerts = [...sampleDisasters];
        
        if (userLocation[0] > 40 && userLocation[0] < 50 && userLocation[1] > -80 && userLocation[1] < -70) {
          localizedAlerts.forEach(alert => {
            alert.country = 'United States';
            alert.region = 'New York';
            alert.location = 'Northeast Region';
          });
        } else if (userLocation[0] > 30 && userLocation[0] < 40 && userLocation[1] > -100 && userLocation[1] < -90) {
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
  }, [userLocation, getUserCountry, getSampleDisasters]);
  
  // Initial load of alerts
  useEffect(() => {
    loadDisasterAlerts();
  }, [loadDisasterAlerts]);
  
  // Periodic check for new alerts
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
