
import { useState, useEffect, useCallback } from 'react';
import { EmergencyService } from '@/types/disasters.d';

export const useEmergencyServices = (userLocation: [number, number] | null) => {
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyService[]>([]);
  
  const loadEmergencyServices = useCallback(async (forceRefresh = false) => {
    try {
      // For demo purposes, we'll return some sample emergency services
      // In a real application, this would fetch from an API based on location
      const sampleServices: EmergencyService[] = [
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
      
      // Modify emergency services based on user location
      if (userLocation) {
        // This would normally use reverse geocoding to determine country
        // For demo, we'll just check rough coordinates
        
        // UK
        if (userLocation[0] > 50 && userLocation[0] < 60 && userLocation[1] > -5 && userLocation[1] < 5) {
          sampleServices.forEach(service => {
            service.phoneNumber = '999';
          });
        }
        // Australia
        else if (userLocation[0] < -20 && userLocation[0] > -40 && userLocation[1] > 110 && userLocation[1] < 160) {
          sampleServices.forEach(service => {
            service.phoneNumber = '000';
          });
        }
        // Europe
        else if (userLocation[0] > 40 && userLocation[0] < 60 && userLocation[1] > 0 && userLocation[1] < 30) {
          sampleServices.forEach(service => {
            service.phoneNumber = '112';
          });
        }
      }
      
      setEmergencyNumbers(sampleServices);
      return sampleServices;
    } catch (error) {
      console.error('Error loading emergency services:', error);
      return [];
    }
  }, [userLocation]);
  
  useEffect(() => {
    loadEmergencyServices();
  }, [loadEmergencyServices]);
  
  return {
    emergencyNumbers,
    loadEmergencyServices
  };
};

export default useEmergencyServices;
