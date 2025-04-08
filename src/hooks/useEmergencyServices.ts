
import { useState, useEffect, useCallback } from 'react';
import { EmergencyService } from '@/types/emergency.d';

export const useEmergencyServices = (userLocation: [number, number] | null) => {
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyService[]>([]);
  
  const loadEmergencyServices = useCallback(async (forceRefresh = false) => {
    try {
      // For demo purposes, we'll generate some sample emergency services
      // In a real application, this would fetch from an API
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
          name: 'Local Police Department',
          type: 'police',
          phoneNumber: '555-1234',
          response_time: 8
        },
        {
          id: '3',
          name: 'Fire Department',
          type: 'fire',
          phoneNumber: '555-4321',
          response_time: 6
        },
        {
          id: '4',
          name: 'Medical Emergency',
          type: 'medical',
          phoneNumber: '555-9876',
          response_time: 10
        }
      ];
      
      setEmergencyNumbers(sampleServices);
      return sampleServices;
    } catch (error) {
      console.error('Error loading emergency services:', error);
      return [];
    }
  }, []);
  
  useEffect(() => {
    loadEmergencyServices();
  }, [loadEmergencyServices]);
  
  return {
    emergencyNumbers,
    loadEmergencyServices
  };
};

export default useEmergencyServices;
