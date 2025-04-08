
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EmergencyService } from '@/types/emergency';

export const useEmergencyServices = (userLocation: [number, number] | null) => {
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyService[]>([]);
  const { toast } = useToast();

  // Get country code from coordinates using the Nominatim service
  const getCountryCode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get location data');
      }
      
      const data = await response.json();
      return data.address?.country_code?.toUpperCase() || 'US';
    } catch (error) {
      console.error('Error getting country code:', error);
      return 'US'; // Default to US
    }
  }, []);

  // Get emergency numbers based on country code
  const getEmergencyNumbers = useCallback((countryCode: string): EmergencyService[] => {
    // Common emergency services by country
    const emergencyServices: Record<string, EmergencyService[]> = {
      US: [
        { name: 'Emergency', number: '911' },
        { name: 'Police', number: '911' },
        { name: 'Fire', number: '911' },
        { name: 'Ambulance', number: '911' },
      ],
      GB: [
        { name: 'Emergency', number: '999' },
        { name: 'Police', number: '999' },
        { name: 'Fire', number: '999' },
        { name: 'Ambulance', number: '999' },
      ],
      AU: [
        { name: 'Emergency', number: '000' },
        { name: 'Police', number: '000' },
        { name: 'Fire', number: '000' },
        { name: 'Ambulance', number: '000' },
      ],
      CA: [
        { name: 'Emergency', number: '911' },
        { name: 'Police', number: '911' },
        { name: 'Fire', number: '911' },
        { name: 'Ambulance', number: '911' },
      ],
      NG: [
        { name: 'Emergency', number: '112' },
        { name: 'Police', number: '112' },
        { name: 'Fire', number: '112' },
        { name: 'Ambulance', number: '112' },
      ],
      IN: [
        { name: 'Emergency', number: '112' },
        { name: 'Police', number: '100' },
        { name: 'Fire', number: '101' },
        { name: 'Ambulance', number: '102' },
      ],
      // Add more countries as needed
    };
    
    return emergencyServices[countryCode] || emergencyServices.US;
  }, []);

  // Load emergency services
  const loadEmergencyServices = useCallback(async (forceRefresh = false) => {
    if (!userLocation) {
      // Default fallback emergency numbers
      setEmergencyNumbers(getEmergencyNumbers('US'));
      return;
    }
    
    try {
      const countryCode = await getCountryCode(userLocation[0], userLocation[1]);
      const services = getEmergencyNumbers(countryCode);
      setEmergencyNumbers(services);
      
      console.log(`Loaded emergency services for country code: ${countryCode}`);
    } catch (error) {
      console.error('Error loading emergency services:', error);
      
      // Fallback to US emergency numbers
      setEmergencyNumbers(getEmergencyNumbers('US'));
      
      toast({
        title: 'Error Loading Emergency Services',
        description: 'Could not load local emergency services. Using default numbers.',
        variant: 'destructive',
      });
    }
  }, [userLocation, toast, getCountryCode, getEmergencyNumbers]);

  // Load emergency services when user location changes
  useEffect(() => {
    loadEmergencyServices();
  }, [userLocation, loadEmergencyServices]);

  return {
    emergencyNumbers,
    loadEmergencyServices
  };
};

export default useEmergencyServices;
