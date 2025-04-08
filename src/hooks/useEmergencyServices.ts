
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
  const lastCountryCodeRef = useRef<string | null>(null);

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
        // Only update if country has changed or it's a forced refresh
        if (forceRefresh || numbers.countryCode !== lastCountryCodeRef.current) {
          setEmergencyNumbers(numbers);
          lastCountryCodeRef.current = numbers.countryCode;
          emergencyNumbersLoadedRef.current = true;
          
          // Only show toast when we have new data
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
          lastCountryCodeRef.current = fallbackNumbers.countryCode;
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
      
      // North America (US/Canada)
      if (lat > 24 && lat < 50 && lng > -125 && lng < -66) {
        return {
          country: "United States",
          countryCode: "US",
          ambulance: "911",
          police: "911",
          fire: "911"
        };
      } 
      // Europe
      else if (lat > 35 && lat < 70 && lng > -10 && lng < 30) {
        return {
          country: "Europe",
          countryCode: "EU",
          ambulance: "112",
          police: "112",
          fire: "112"
        };
      } 
      // United Kingdom
      else if (lat > 50 && lat < 59 && lng > -8 && lng < 2) {
        return {
          country: "United Kingdom",
          countryCode: "GB",
          ambulance: "999",
          police: "999",
          fire: "999"
        };
      }
      // Australia/Oceania
      else if (lat > -10 && lat < 35 && lng > 100 && lng < 145) {
        return {
          country: "Australia",
          countryCode: "AU",
          ambulance: "000",
          police: "000",
          fire: "000"
        };
      }
      // India
      else if (lat > 8 && lat < 35 && lng > 68 && lng < 97) {
        return {
          country: "India",
          countryCode: "IN",
          police: "100",
          ambulance: "102",
          fire: "101"
        };
      }
      // Try to determine from browser language as last resort
      else {
        try {
          const browserLang = navigator.language;
          if (browserLang) {
            const countryCode = browserLang.split('-')[1];
            if (countryCode) {
              // Attempt to get emergency numbers for this country code
              const numbers = await emergencyService.getEmergencyNumbers(countryCode);
              if (numbers) return numbers;
            }
          }
        } catch (e) {
          console.error("Error determining country from language:", e);
        }
        
        // Default international
        return {
          country: "International",
          countryCode: "INTL",
          ambulance: "112",
          police: "112",
          fire: "112"
        };
      }
    } catch (error) {
      console.error("Error determining fallback emergency numbers:", error);
      return {
        country: "International",
        countryCode: "INTL",
        ambulance: "112",
        police: "112",
        fire: "112"
      };
    }
  };

  // Load emergency services when location changes
  useEffect(() => {
    if (userLocationRef.current !== userLocation) {
      loadEmergencyServices();
    }
  }, [userLocation, loadEmergencyServices]);

  // Initial load attempt with a timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userLocation && !emergencyNumbersLoadedRef.current) {
        loadEmergencyServices(true);
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [userLocation, loadEmergencyServices]);

  return {
    emergencyNumbers,
    loading,
    loadEmergencyServices
  };
};

export default useEmergencyServices;
