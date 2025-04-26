
import { useState, useEffect, useCallback } from 'react';
import { DisasterAlert } from '@/types/disasters';
import reliefWebService from '@/services/reliefWebService';
import { useToast } from '@/hooks/use-toast';
import { useLocationMapping } from './disaster-alerts/useLocationMapping';
import { useSampleAlerts } from './disaster-alerts/useSampleAlerts';

export const useDisasterAlerts = (userLocation: [number, number] | null) => {
  const [disasterAlerts, setDisasterAlerts] = useState<DisasterAlert[]>([]);
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toISOString());
  const { toast } = useToast();
  const { getUserCountry } = useLocationMapping();
  const { getSampleDisasters } = useSampleAlerts();
  
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
  
  const checkForNewAlerts = useCallback(async () => {
    try {
      const userCountry = getUserCountry(userLocation);
      const newAlerts = await reliefWebService.checkForNewAlerts(lastCheckTime, userCountry);
      
      setLastCheckTime(new Date().toISOString());
      
      if (newAlerts.length > 0) {
        setDisasterAlerts(prevAlerts => {
          const newAlertsToAdd = newAlerts.filter(
            newAlert => !prevAlerts.some(prevAlert => prevAlert.id === newAlert.id)
          );
          
          if (newAlertsToAdd.length > 0) {
            const highPriorityAlerts = newAlertsToAdd.filter(alert => alert.severity === 'warning');
            
            if (highPriorityAlerts.length > 0) {
              toast({
                title: "Urgent Humanitarian Alert",
                description: highPriorityAlerts[0].title,
                variant: "destructive"
              });
            } else {
              toast({
                title: "New Humanitarian Alert",
                description: `${newAlertsToAdd[0].title} - ${newAlertsToAdd[0].location}`,
              });
            }
          }
          
          return [...newAlertsToAdd, ...prevAlerts]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for new disaster alerts:', error);
      return false;
    }
  }, [lastCheckTime, getUserCountry, userLocation, toast]);
  
  useEffect(() => {
    loadDisasterAlerts();
  }, [loadDisasterAlerts]);
  
  useEffect(() => {
    const checkInterval = setInterval(() => {
      checkForNewAlerts();
    }, 3600000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [checkForNewAlerts]);
  
  return {
    disasterAlerts,
    loadDisasterAlerts,
    checkForNewAlerts
  };
};

export default useDisasterAlerts;
