
import { useState, useEffect, useCallback } from 'react';
import { DisasterAlert } from '@/types/disasters';
import reliefWebService from '@/services/reliefWebService';
import { fetchActiveNaturalEvents, transformEonetToDisasterAlerts } from '@/services/eonetService';
import { weatherService } from '@/services/weatherService'; 
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
      let locationString = '';
      
      // If we have user location, convert it to a string for the weather API
      if (userLocation) {
        locationString = `${userLocation[0]},${userLocation[1]}`;
      }
      
      // Fetch disasters from multiple sources
      const [reliefWebAlerts, eonetEvents, weatherAlerts] = await Promise.all([
        reliefWebService.fetchDisasterAlerts(userCountry),
        fetchActiveNaturalEvents(),
        userLocation ? weatherService.transformWeatherAlertsToDisasterAlerts(locationString) : []
      ]);
      
      // Transform EONET events to our disaster alert format
      const eonetAlerts = transformEonetToDisasterAlerts(eonetEvents);
      
      // Combine alerts from all sources
      let combinedAlerts = [...reliefWebAlerts, ...eonetAlerts, ...weatherAlerts];
      
      // De-duplicate alerts by comparing titles and locations
      combinedAlerts = deduplicateAlerts(combinedAlerts);
      
      if (combinedAlerts.length > 0) {
        setDisasterAlerts(combinedAlerts);
        return combinedAlerts;
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

  // Helper function to deduplicate alerts from multiple sources
  const deduplicateAlerts = (alerts: DisasterAlert[]): DisasterAlert[] => {
    const uniqueAlerts: DisasterAlert[] = [];
    const seenKeys = new Set<string>();

    alerts.forEach(alert => {
      // Create a unique key from title and location
      const key = `${alert.title.toLowerCase()}-${alert.location.toLowerCase()}`;
      
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueAlerts.push(alert);
      }
    });

    return uniqueAlerts;
  };
  
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
