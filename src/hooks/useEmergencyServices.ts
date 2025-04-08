
import { useState, useEffect, useCallback } from 'react';
import { EmergencyService } from '@/types/emergency.d';

interface EmergencyNumbers {
  country: string;
  ambulance: string;
  police: string;
  fire: string;
  general: string;
}

export const useEmergencyServices = (userLocation: [number, number] | null) => {
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyNumbers>({
    country: 'United States',
    ambulance: '911',
    police: '911',
    fire: '911',
    general: '911'
  });
  
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);
  
  const loadEmergencyServices = useCallback(async (forceRefresh = false) => {
    try {
      // For demo purposes, we'll generate some sample emergency services
      // In a real application, this would fetch from an API
      const sampleServices: EmergencyService[] = [
        {
          name: 'Emergency Services',
          type: 'general',
          phoneNumber: '911',
          response_time: 5
        },
        {
          name: 'Local Police Department',
          type: 'police',
          phoneNumber: '555-1234',
          response_time: 8
        },
        {
          name: 'Fire Department',
          type: 'fire',
          phoneNumber: '555-4321',
          response_time: 6
        },
        {
          name: 'Medical Emergency',
          type: 'medical',
          phoneNumber: '555-9876',
          response_time: 10
        }
      ];
      
      // Update emergency numbers based on location
      // For demo, we'll use US numbers
      const numbersData = {
        country: 'United States',
        ambulance: '911',
        police: '911',
        fire: '911',
        general: '911'
      };
      
      // If we had location data, we could customize the numbers
      if (userLocation) {
        // This would normally use a geocoding API to determine the country
        // and then get the appropriate emergency numbers
        
        // Example logic for demonstration:
        if (userLocation[0] > 49 && userLocation[0] < 60 && userLocation[1] > -130 && userLocation[1] < -110) {
          // Canada
          numbersData.country = 'Canada';
        } else if (userLocation[0] > 35 && userLocation[0] < 58 && userLocation[1] > -10 && userLocation[1] < 40) {
          // Europe
          numbersData.country = 'Europe';
          numbersData.ambulance = '112';
          numbersData.police = '112';
          numbersData.fire = '112';
          numbersData.general = '112';
        }
      }
      
      setEmergencyServices(sampleServices);
      setEmergencyNumbers(numbersData);
      
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
    emergencyServices,
    emergencyNumbers,
    loadEmergencyServices
  };
};

export default useEmergencyServices;
