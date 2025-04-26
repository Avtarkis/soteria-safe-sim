
import { useState, useEffect, useCallback } from 'react';
import { DisasterAlert, DisasterAlertType, DisasterAlertSeverity } from '@/types/disasters.d';
import reliefWebService from '@/services/reliefWebService';
import { useToast } from '@/hooks/use-toast';

export const useDisasterAlerts = (userLocation: [number, number] | null) => {
  const [disasterAlerts, setDisasterAlerts] = useState<DisasterAlert[]>([]);
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toISOString());
  const { toast } = useToast();
  
  // Function to get country based on user location
  const getUserCountry = useCallback((location: [number, number] | null): string | undefined => {
    // This is a simplified approach - in a real app, you would use reverse geocoding
    // For this implementation, we'll just use some examples
    if (!location) return undefined;
    
    // Rough checks for demo purposes
    const [lat, lng] = location;
    
    // Nigeria (rough boundaries)
    if (lat > 4 && lat < 14 && lng > 2 && lng < 15) {
      return 'Nigeria';
    }
    
    // U.S. (rough boundaries)
    if (lat > 24 && lat < 50 && lng > -125 && lng < -66) {
      return 'United States of America';
    }
    
    // Just return undefined for other locations
    return undefined;
  }, []);
  
  const loadDisasterAlerts = useCallback(async (forceRefresh = false) => {
    try {
      // Determine user's country from location if available
      const userCountry = getUserCountry(userLocation);
      
      // Fetch alerts from ReliefWeb API
      const apiAlerts = await reliefWebService.fetchDisasterAlerts(userCountry);
      
      // If we have real alerts from the API, use them
      if (apiAlerts.length > 0) {
        setDisasterAlerts(apiAlerts);
        return apiAlerts;
      }
      
      // Fallback to sample data if API call returns no results
      // This is mostly for development and testing purposes
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
          active: true,
          country: 'United States',
          region: 'California'
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
          active: true,
          country: 'United States',
          region: 'California'
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
  }, [userLocation, getUserCountry]);
  
  // Function to check for new alerts
  const checkForNewAlerts = useCallback(async () => {
    try {
      const userCountry = getUserCountry(userLocation);
      const newAlerts = await reliefWebService.checkForNewAlerts(lastCheckTime, userCountry);
      
      // Update last check time
      setLastCheckTime(new Date().toISOString());
      
      // If new alerts are found, notify the user and update state
      if (newAlerts.length > 0) {
        // Update the alerts list
        setDisasterAlerts(prevAlerts => {
          // Filter out any alerts we already have (by ID)
          const newAlertsToAdd = newAlerts.filter(
            newAlert => !prevAlerts.some(prevAlert => prevAlert.id === newAlert.id)
          );
          
          // If we have new alerts, show a notification
          if (newAlertsToAdd.length > 0) {
            const highPriorityAlerts = newAlertsToAdd.filter(alert => alert.severity === 'warning');
            
            // Show a toast for high priority alerts
            if (highPriorityAlerts.length > 0) {
              toast({
                title: "Urgent Humanitarian Alert",
                description: highPriorityAlerts[0].title,
                variant: "destructive"
              });
            } 
            // Show a standard toast for other alerts
            else if (newAlertsToAdd.length > 0) {
              toast({
                title: "New Humanitarian Alert",
                description: `${newAlertsToAdd[0].title} - ${newAlertsToAdd[0].location}`,
              });
            }
          }
          
          // Return combined new and existing alerts, sorted by date
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
  
  // Load initial alerts on component mount
  useEffect(() => {
    loadDisasterAlerts();
  }, [loadDisasterAlerts]);
  
  // Set up periodic checking for new alerts (every hour)
  useEffect(() => {
    // Check every hour (3600000 ms)
    const checkInterval = setInterval(() => {
      checkForNewAlerts();
    }, 3600000);
    
    // Cleanup on component unmount
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
