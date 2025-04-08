
import { useState, useEffect, useCallback, useRef } from 'react';
import { emergencyService } from '@/services/emergencyService';
import { useToast } from '@/hooks/use-toast';

export const useEmergencyServices = (userLocation: [number, number] | null) => {
  const [emergencyNumbers, setEmergencyNumbers] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const emergencyNumbersLoadedRef = useRef(false);
  const userLocationRef = useRef<[number, number] | null>(null);
  const loadAttemptsRef = useRef(0);

  const loadEmergencyServices = useCallback(async (forceRefresh = false) => {
    // Don't proceed if no location or if already loaded (unless forced)
    if (!userLocation || 
        (emergencyNumbersLoadedRef.current && 
         !forceRefresh && 
         JSON.stringify(userLocationRef.current) === JSON.stringify(userLocation))) return;
    
    // Update location ref and set loading
    userLocationRef.current = userLocation;
    setLoading(true);
    
    try {
      // Track attempts to avoid infinite loops
      loadAttemptsRef.current += 1;
      
      console.log("Loading emergency services for location:", userLocation);
      const numbers = await emergencyService.getEmergencyNumbersByLocation(userLocation[0], userLocation[1]);
      
      if (numbers) {
        setEmergencyNumbers(numbers);
        emergencyNumbersLoadedRef.current = true;
        
        // Only show toast when we have new data
        if (forceRefresh || loadAttemptsRef.current <= 2) {
          toast({
            title: "Emergency Services",
            description: `Loaded emergency numbers for ${numbers.country}`,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load emergency numbers:", err);
      
      // If we can't get the data, use a fallback for the current location
      if (loadAttemptsRef.current <= 3) {
        const fallbackNumbers = await determineFallbackEmergencyNumbers(userLocation);
        if (fallbackNumbers) {
          setEmergencyNumbers(fallbackNumbers);
          emergencyNumbersLoadedRef.current = true;
        }
      }
    } finally {
      setLoading(false);
    }
  }, [userLocation, toast]);

  // Helper function to determine fallback emergency numbers based on rough location
  const determineFallbackEmergencyNumbers = async (location: [number, number]) => {
    // Simple reverse geocoding based on latitude to determine continent/region
    try {
      const [lat, lng] = location;
      
      // Rough determination of country/region based on coordinates
      if (lat > 24 && lat < 50 && lng > -125 && lng < -66) {
        // North America (US/Canada)
        return {
          country: "United States",
          ambulance: "911",
          police: "911",
          fire: "911"
        };
      } else if (lat > 35 && lat < 70 && lng > -10 && lng < 30) {
        // Europe
        return {
          country: "Europe",
          ambulance: "112",
          police: "112",
          fire: "112"
        };
      } else if (lat > -10 && lat < 35 && lng > 100 && lng < 145) {
        // Australia/Oceania
        return {
          country: "Australia",
          ambulance: "000",
          police: "000",
          fire: "000"
        };
      } else {
        // Default international
        return {
          country: "International",
          ambulance: "112",
          police: "112",
          fire: "112"
        };
      }
    } catch (error) {
      console.error("Error determining fallback emergency numbers:", error);
      return null;
    }
  };

  // Load emergency services when location changes
  useEffect(() => {
    if (userLocationRef.current !== userLocation) {
      loadEmergencyServices();
    }
  }, [userLocation, loadEmergencyServices]);

  return {
    emergencyNumbers,
    loading,
    loadEmergencyServices
  };
};

export default useEmergencyServices;
