
import { useState, useEffect, useCallback } from 'react';
import { EmergencyService } from '@/types/disasters.d';
import { emergencyService } from '@/services/emergencyService';

export const useEmergencyServices = (userLocation: [number, number] | null) => {
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyService[]>([]);
  const [countryCode, setCountryCode] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const loadEmergencyServices = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      let services: EmergencyService[] = [];
      
      // Try to get location-based emergency numbers
      if (userLocation) {
        const [lat, lng] = userLocation;
        try {
          const locationBasedNumbers = await emergencyService.getEmergencyNumbersByLocation(lat, lng);
          
          if (locationBasedNumbers) {
            setCountryCode(locationBasedNumbers.countryCode);
            
            services = [
              {
                id: '1',
                name: 'Emergency Services',
                type: 'general',
                phoneNumber: locationBasedNumbers.general || locationBasedNumbers.police,
                response_time: 5
              },
              {
                id: '2',
                name: 'Police Department',
                type: 'police',
                phoneNumber: locationBasedNumbers.police,
                response_time: 7
              },
              {
                id: '3',
                name: 'Medical Emergency',
                type: 'medical',
                phoneNumber: locationBasedNumbers.ambulance,
                response_time: 6
              },
              {
                id: '4',
                name: 'Fire Department',
                type: 'fire',
                phoneNumber: locationBasedNumbers.fire,
                response_time: 8
              }
            ];
            
            setEmergencyNumbers(services);
            return services;
          }
        } catch (error) {
          console.error('Error loading location-based emergency services:', error);
          // Continue with default numbers
        }
      }
      
      // Default emergency services as fallback
      const defaultServices: EmergencyService[] = [
        {
          id: '1',
          name: 'Emergency Services',
          type: 'general',
          phoneNumber: '911',
          response_time: 5
        },
        {
          id: '2',
          name: 'Police Department',
          type: 'police',
          phoneNumber: '911',
          response_time: 7
        },
        {
          id: '3',
          name: 'Fire Department',
          type: 'fire',
          phoneNumber: '911',
          response_time: 6
        },
        {
          id: '4',
          name: 'Medical Emergency',
          type: 'medical',
          phoneNumber: '911',
          response_time: 8
        }
      ];
      
      setEmergencyNumbers(defaultServices);
      return defaultServices;
    } catch (error) {
      console.error('Error loading emergency services:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);
  
  useEffect(() => {
    loadEmergencyServices();
    
    // Also check for updates to emergency numbers database
    emergencyService.checkForUpdates();
  }, [loadEmergencyServices]);
  
  return {
    emergencyNumbers,
    loadEmergencyServices,
    countryCode,
    isLoading
  };
};

export default useEmergencyServices;
