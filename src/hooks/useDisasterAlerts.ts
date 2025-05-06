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
        console.log(`Getting alerts for location: ${locationString} in country: ${userCountry || 'unknown'}`);
      }
      
      // Fetch disasters from multiple sources
      const [reliefWebAlerts, eonetEvents, weatherAlerts] = await Promise.all([
        reliefWebService.fetchDisasterAlerts(userCountry),
        fetchActiveNaturalEvents(),
        userLocation ? weatherService.transformWeatherAlertsToDisasterAlerts(locationString) : []
      ]);
      
      console.log(`Fetched alerts - ReliefWeb: ${reliefWebAlerts.length}, EONET: ${eonetEvents.length}, Weather: ${weatherAlerts.length}`);
      
      // Transform EONET events to our disaster alert format with better coordinate parsing
      const eonetAlerts = transformEonetToDisasterAlerts(eonetEvents);
      
      // Combine alerts from all sources
      let combinedAlerts = [...reliefWebAlerts, ...eonetAlerts, ...weatherAlerts];
      
      // Pre-filter alerts by relevance before deduplication
      if (userLocation) {
        combinedAlerts = preFilterByLocation(combinedAlerts, userLocation);
      }
      
      // De-duplicate alerts by comparing titles and locations
      combinedAlerts = deduplicateAlerts(combinedAlerts);
      
      // If we have user location, localize the alerts
      if (userLocation) {
        combinedAlerts = localizeAlerts(combinedAlerts, userLocation);
        console.log(`Localized ${combinedAlerts.length} alerts for coordinates: ${userLocation[0]}, ${userLocation[1]}`);
      }
      
      if (combinedAlerts.length > 0) {
        setDisasterAlerts(combinedAlerts);
        return combinedAlerts;
      }
      
      // If no alerts, use sample disasters
      const sampleDisasters = getSampleDisasters();
      let alerts = sampleDisasters;
      
      if (userLocation) {
        alerts = localizeAlerts(sampleDisasters, userLocation);
        console.log(`Using ${alerts.length} localized sample alerts for coordinates: ${userLocation[0]}, ${userLocation[1]}`);
      }
      
      setDisasterAlerts(alerts);
      return alerts;
    } catch (error) {
      console.error('Error loading disaster alerts:', error);
      
      // Even if there's an error, try to use sample disasters
      const sampleDisasters = getSampleDisasters();
      let alerts = userLocation ? localizeAlerts(sampleDisasters, userLocation) : sampleDisasters;
      setDisasterAlerts(alerts);
      
      return alerts;
    }
  }, [userLocation, getUserCountry, getSampleDisasters, localizeAlerts]);

  // Pre-filter alerts by location relevance before localizing
  const preFilterByLocation = (alerts: DisasterAlert[], userLocation: [number, number]): DisasterAlert[] => {
    const [userLat, userLng] = userLocation;
    
    return alerts.filter(alert => {
      // Keep alerts without coordinates
      if (!alert.coordinates || !Array.isArray(alert.coordinates)) {
        return true;
      }
      
      // Calculate distance between alert and user
      const [alertLat, alertLng] = alert.coordinates;
      
      // Simple distance calculation (rough approximation)
      const latDiff = Math.abs(userLat - alertLat);
      const lngDiff = Math.abs(userLng - alertLng);
      
      // If within approximately 500km (rough calculation), keep the alert
      return (latDiff < 5 && lngDiff < 5);
    });
  };

  // Helper function to deduplicate alerts from multiple sources
  const deduplicateAlerts = (alerts: DisasterAlert[]): DisasterAlert[] => {
    const uniqueAlerts: DisasterAlert[] = [];
    const seenKeys = new Set<string>();

    alerts.forEach(alert => {
      // Create a unique key from title, type and location
      const key = `${alert.title.toLowerCase()}-${alert.type}-${alert.location.toLowerCase()}`;
      
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
