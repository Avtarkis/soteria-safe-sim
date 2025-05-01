
import { useState, useEffect } from 'react';
import { useLocationMapping } from '@/hooks/disaster-alerts/useLocationMapping';
import { useToast } from '@/hooks/use-toast';

type SupportedCurrency = 'usd' | 'ngn';
type SupportedCountry = 'United States of America' | 'Nigeria' | undefined;

export function useLocationBasedCurrency() {
  const [currency, setCurrency] = useState<SupportedCurrency>('usd');
  const [country, setCountry] = useState<SupportedCountry>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { getUserCountry } = useLocationMapping();
  const { toast } = useToast();

  // Get user location
  useEffect(() => {
    setIsLoading(true);
    
    // Try to get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: 'Location Error',
          description: 'Unable to determine your location. Default currency will be used.',
          variant: 'destructive'
        });
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, [toast]);

  // Determine country and currency based on location
  useEffect(() => {
    if (userLocation) {
      const detectedCountry = getUserCountry(userLocation) as SupportedCountry;
      setCountry(detectedCountry);
      
      // Set currency based on country
      if (detectedCountry === 'Nigeria') {
        setCurrency('ngn');
      } else if (detectedCountry === 'United States of America') {
        setCurrency('usd');
      } else {
        // Default to USD for other countries
        setCurrency('usd');
      }
    }
  }, [userLocation, getUserCountry]);

  // Function to manually set currency (which will be restricted based on country)
  const attemptCurrencyChange = (newCurrency: SupportedCurrency): boolean => {
    // Only allow NGN for Nigeria
    if (newCurrency === 'ngn' && country !== 'Nigeria') {
      toast({
        title: 'Currency Not Available',
        description: 'NGN currency is only available for users in Nigeria.',
        variant: 'destructive'
      });
      return false;
    }
    
    // Only allow USD for USA
    if (newCurrency === 'usd' && country !== 'United States of America') {
      toast({
        title: 'Currency Not Available',
        description: 'USD currency is only available for users in the United States.',
        variant: 'destructive'
      });
      return false;
    }
    
    // If it passes validation, set the currency
    setCurrency(newCurrency);
    return true;
  };

  return {
    currency,
    country,
    isLoading,
    attemptCurrencyChange
  };
}
