
import { useState, useEffect, useCallback, useRef } from 'react';
import { emergencyService } from '@/services/emergencyService';
import { useToast } from '@/hooks/use-toast';

export const useEmergencyServices = (userLocation: [number, number] | null) => {
  const [emergencyNumbers, setEmergencyNumbers] = useState<any>(null);
  const { toast } = useToast();
  const emergencyNumbersLoadedRef = useRef(false);
  const userLocationRef = useRef<[number, number] | null>(null);

  const loadEmergencyServices = useCallback(async (forceRefresh = false) => {
    if (!userLocation || 
        (emergencyNumbersLoadedRef.current && 
         !forceRefresh && 
         userLocationRef.current === userLocation)) return;
    
    userLocationRef.current = userLocation;
    
    try {
      const numbers = await emergencyService.getEmergencyNumbersByLocation(userLocation[0], userLocation[1]);
      if (numbers) {
        setEmergencyNumbers(numbers);
        emergencyNumbersLoadedRef.current = true;
        toast({
          title: "Emergency Services",
          description: `Loaded emergency numbers for ${numbers.country}`,
        });
      }
    } catch (err) {
      console.error("Failed to load emergency numbers:", err);
    }
  }, [userLocation, toast]);

  useEffect(() => {
    if (userLocationRef.current !== userLocation) {
      loadEmergencyServices();
    }
  }, [userLocation, loadEmergencyServices]);

  return {
    emergencyNumbers,
    loadEmergencyServices
  };
};
