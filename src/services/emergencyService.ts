import axios from 'axios';
import { emergencyNumbersCache } from '@/utils/caching/emergencyNumbersCache';
import { emergencyNumbersUpdater } from '@/utils/emergency/emergencyNumbersUpdater';
import { 
  globalEmergencyNumbers, 
  getRegionalEmergencyNumber, 
  EmergencyNumber 
} from '@/utils/emergency/emergencyNumbersDatabase';

interface DisasterAlert {
  id: string;
  title: string;
  description: string;
  country: string;
  date: string;
  status: string;
  url: string;
  severity: 'alert' | 'warning' | 'watch' | 'advisory';
  type: string;
}

export const emergencyService = {
  /**
   * Get emergency numbers for a specific country
   * @param countryCode ISO country code (e.g., 'US', 'GB', 'FR')
   */
  getEmergencyNumbers: async (countryCode: string): Promise<EmergencyNumber | null> => {
    try {
      console.log("Getting emergency numbers for country code:", countryCode);
      
      // First check cache
      const cachedData = emergencyNumbersCache.get(countryCode);
      if (cachedData) {
        console.log("Using cached emergency numbers for", countryCode);
        return cachedData;
      }
      
      // Check if we have hard-coded reliable data for this country
      if (globalEmergencyNumbers[countryCode.toUpperCase()]) {
        const numbers = globalEmergencyNumbers[countryCode.toUpperCase()];
        // Store in cache for future use
        emergencyNumbersCache.set(countryCode, numbers, 'local');
        return numbers;
      }
      
      // If we don't have reliable data, try the API
      try {
        const response = await axios.get(`https://emergencynumberapi.com/api/country/${countryCode}`, {
          timeout: 5000 // 5 second timeout
        });
        
        if (response.data && response.data.data) {
          const data = response.data.data;
          const emergencyNumber: EmergencyNumber = {
            country: data.name || '',
            countryCode: data.code || countryCode,
            police: data.police || '911',
            ambulance: data.ambulance || '911',
            fire: data.fire || '911'
          };
          
          // Store API result in cache
          emergencyNumbersCache.set(countryCode, emergencyNumber, 'api');
          return emergencyNumber;
        }
      } catch (apiError) {
        console.warn("API error for emergency numbers:", apiError);
        // Continue to fallbacks
      }
      
      // Try regional emergency system if specific country lookup failed
      const regionalEmergency = getRegionalEmergencyNumber(countryCode.toUpperCase());
      if (regionalEmergency) {
        emergencyNumbersCache.set(countryCode, regionalEmergency, 'fallback');
        return regionalEmergency;
      }
      
      // If all else fails, provide a generic fallback based on continent/region
      return emergencyService.getFallbackEmergencyNumber(countryCode);
    } catch (error) {
      console.error('Error fetching emergency numbers:', error);
      return emergencyService.getFallbackEmergencyNumber(countryCode);
    }
  },
  
  /**
   * Get fallback emergency number when all else fails
   */
  getFallbackEmergencyNumber: (countryCode: string): EmergencyNumber => {
    // Try to determine fallback by locale or other available information
    try {
      // Use browser language as a hint
      if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language || (navigator as any).userLanguage;
        if (browserLang) {
          const langCountry = browserLang.split('-')[1];
          if (langCountry && globalEmergencyNumbers[langCountry]) {
            return globalEmergencyNumbers[langCountry];
          }
        }
      }
      
      // Try to guess from timezone
      if (typeof Intl !== 'undefined') {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (timezone.includes('America')) {
          return globalEmergencyNumbers['US'];
        } else if (timezone.includes('Europe')) {
          return {
            country: 'Europe',
            countryCode: 'EU',
            police: '112',
            ambulance: '112',
            fire: '112',
            general: '112'
          };
        } else if (timezone.includes('Asia/India')) {
          return globalEmergencyNumbers['IN'];
        } else if (timezone.includes('Australia')) {
          return globalEmergencyNumbers['AU'];
        } else if (timezone.includes('Asia')) {
          return {
            country: 'Asia',
            countryCode: 'AS',
            police: '110',
            ambulance: '120',
            fire: '119',
            general: '112'
          };
        } else if (timezone.includes('Africa')) {
          return {
            country: 'Africa',
            countryCode: 'AF',
            police: '112',
            ambulance: '112',
            fire: '112',
            general: '112'
          };
        }
      }
    } catch (e) {
      console.error('Error determining fallback emergency number:', e);
    }
    
    // Final international fallback
    return {
      country: 'International',
      countryCode: countryCode || 'INTL',
      police: '112',
      ambulance: '112',
      fire: '112',
      general: '112'
    };
  },
  
  /**
   * Get emergency numbers based on GPS coordinates
   * Uses reverse geocoding to determine country
   */
  getEmergencyNumbersByLocation: async (latitude: number, longitude: number): Promise<EmergencyNumber | null> => {
    try {
      console.log(`Getting emergency numbers for location: ${latitude}, ${longitude}`);
      
      // Check if we have cached results for this location
      const cachedResult = emergencyNumbersCache.getLocationBased(latitude, longitude);
      if (cachedResult) {
        console.log("Using cached location-based emergency numbers");
        return cachedResult;
      }
      
      // First, get the country code from coordinates using reverse geocoding
      try {
        const reverseGeoResponse = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
          {
            headers: {
              'User-Agent': 'Soteria Safety App (https://soteria-safety.app)'
            },
            timeout: 5000 // 5 second timeout for geo request
          }
        );
        
        console.log("Reverse geocoding response:", reverseGeoResponse.data);
        
        let countryCode = '';
        if (reverseGeoResponse.data && reverseGeoResponse.data.address) {
          countryCode = reverseGeoResponse.data.address.country_code?.toUpperCase();
        }
        
        if (!countryCode) {
          throw new Error("Could not determine country code from coordinates");
        }
        
        console.log("Detected country code:", countryCode);
        
        // Get emergency numbers for that country
        const emergencyNumbers = await emergencyService.getEmergencyNumbers(countryCode);
        
        // Cache the result by both country code and coordinates
        if (emergencyNumbers) {
          emergencyNumbersCache.setLocationBased(
            latitude, 
            longitude, 
            countryCode, 
            emergencyNumbers
          );
        }
        
        return emergencyNumbers;
      } catch (geoError) {
        console.error("Error in reverse geocoding:", geoError);
        throw geoError; // Propagate to outer catch block
      }
    } catch (error) {
      console.error('Error getting emergency numbers by location:', error);
      
      // Try to make a best guess based on the coordinates
      let guessedCountryCode = 'US'; // Default
      
      // Rough estimation of regions by coordinates
      // North America
      if (latitude > 24 && latitude < 50 && longitude > -125 && longitude < -66) {
        guessedCountryCode = 'US'; // United States
      } 
      // Canada
      else if (latitude > 49 && latitude < 60 && longitude > -125 && longitude < -55) {
        guessedCountryCode = 'CA'; // Canada
      } 
      // Europe
      else if (latitude > 35 && latitude < 60 && longitude > -10 && longitude < 40) {
        guessedCountryCode = 'EU'; // Europe (general)
      } 
      // Australia
      else if (latitude > -40 && latitude < -10 && longitude > 110 && longitude < 155) {
        guessedCountryCode = 'AU'; // Australia
      }
      // United Kingdom
      else if (latitude > 50 && latitude < 59 && longitude > -8 && longitude < 2) {
        guessedCountryCode = 'GB'; // United Kingdom
      }
      // India
      else if (latitude > 8 && latitude < 35 && longitude > 68 && longitude < 97) {
        guessedCountryCode = 'IN'; // India
      }
      // Brazil
      else if (latitude > -35 && latitude < 5 && longitude > -75 && longitude < -30) {
        guessedCountryCode = 'BR'; // Brazil
      }
      // South Africa
      else if (latitude > -35 && latitude < -20 && longitude > 15 && longitude < 35) {
        guessedCountryCode = 'ZA'; // South Africa
      }
      // Japan
      else if (latitude > 30 && latitude < 45 && longitude > 130 && longitude < 145) {
        guessedCountryCode = 'JP'; // Japan  
      }
      
      return emergencyService.getEmergencyNumbers(guessedCountryCode);
    }
  },
  
  /**
   * Check if emergency numbers database needs updating
   * This would typically connect to a backend service to check for updates
   */
  checkForUpdates: async (): Promise<boolean> => {
    return emergencyNumbersUpdater.checkForUpdates();
  },
  
  /**
   * Get disaster alerts from ReliefWeb API
   * @param limit Number of alerts to retrieve
   * @param countryCode Optional country code to filter alerts
   */
  getDisasterAlerts: async (limit = 10, countryCode?: string): Promise<DisasterAlert[]> => {
    try {
      let url = 'https://api.reliefweb.int/v1/disasters';
      const params: any = {
        appname: 'soteria-safety-app',
        profile: 'list',
        preset: 'latest',
        limit
      };
      
      if (countryCode) {
        params.filter = {
          field: 'country.iso3',
          value: countryCode
        };
      }
      
      const response = await axios.post(url, params);
      
      if (response.data && response.data.data) {
        return response.data.data.map((item: any) => {
          const fields = item.fields || {};
          return {
            id: fields.id || item.id,
            title: fields.name || 'Unknown Disaster',
            description: fields.description || '',
            country: fields.country?.[0]?.name || 'Global',
            date: fields.date?.created || new Date().toISOString(),
            status: fields.status || 'alert',
            url: fields.url || '',
            severity: fields.primary_type?.name?.includes('Alert') ? 'alert' : 'warning',
            type: fields.primary_type?.name || 'Disaster'
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching disaster alerts:', error);
      
      // Return mock data if API fails
      return [
        {
          id: 'mock-1',
          title: 'Severe Weather Alert',
          description: 'Heavy rainfall and potential flooding expected in coastal areas.',
          country: 'United States',
          date: new Date().toISOString(),
          status: 'active',
          url: 'https://example.com/alert',
          severity: 'warning',
          type: 'Weather'
        },
        {
          id: 'mock-2',
          title: 'Earthquake Advisory',
          description: 'Recent 4.5 magnitude earthquake reported. Aftershocks possible.',
          country: 'Japan',
          date: new Date().toISOString(),
          status: 'active',
          url: 'https://example.com/alert',
          severity: 'advisory',
          type: 'Earthquake'
        }
      ];
    }
  },
  
  /**
   * Get disaster alerts near a location
   * @param latitude Location latitude
   * @param longitude Location longitude
   * @param radiusKm Search radius in kilometers
   * @param limit Maximum number of results
   */
  getDisasterAlertsNearLocation: async (
    latitude: number,
    longitude: number,
    radiusKm = 100,
    limit = 5
  ): Promise<DisasterAlert[]> => {
    try {
      // First get the country code from the coordinates
      const reverseGeoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      
      const countryCode = reverseGeoResponse.data.address.country_code.toUpperCase();
      
      // Get alerts for that country
      const alerts = await emergencyService.getDisasterAlerts(limit, countryCode);
      
      return alerts;
    } catch (error) {
      console.error('Error getting disaster alerts near location:', error);
      
      // Return mock data if API fails
      return [
        {
          id: 'local-1',
          title: 'Local Weather Alert',
          description: 'Weather conditions changing rapidly in your area.',
          country: 'Near your location',
          date: new Date().toISOString(),
          status: 'active',
          url: 'https://example.com/alert',
          severity: 'watch',
          type: 'Weather'
        }
      ];
    }
  }
};
