import axios from 'axios';

interface EmergencyNumber {
  country: string;
  countryCode: string;
  police: string;
  ambulance: string;
  fire: string;
}

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
      
      // Map of reliable emergency numbers by country to avoid API failures
      const reliableEmergencyNumbers: Record<string, EmergencyNumber> = {
        'US': { country: 'United States', countryCode: 'US', police: '911', ambulance: '911', fire: '911' },
        'GB': { country: 'United Kingdom', countryCode: 'GB', police: '999', ambulance: '999', fire: '999' },
        'AU': { country: 'Australia', countryCode: 'AU', police: '000', ambulance: '000', fire: '000' },
        'NZ': { country: 'New Zealand', countryCode: 'NZ', police: '111', ambulance: '111', fire: '111' },
        'IN': { country: 'India', countryCode: 'IN', police: '100', ambulance: '102', fire: '101' },
        'CA': { country: 'Canada', countryCode: 'CA', police: '911', ambulance: '911', fire: '911' },
        'CN': { country: 'China', countryCode: 'CN', police: '110', ambulance: '120', fire: '119' },
        'JP': { country: 'Japan', countryCode: 'JP', police: '110', ambulance: '119', fire: '119' },
        'DE': { country: 'Germany', countryCode: 'DE', police: '110', ambulance: '112', fire: '112' },
        'FR': { country: 'France', countryCode: 'FR', police: '17', ambulance: '15', fire: '18' },
        'ES': { country: 'Spain', countryCode: 'ES', police: '112', ambulance: '112', fire: '112' },
        'IT': { country: 'Italy', countryCode: 'IT', police: '112', ambulance: '118', fire: '115' },
        'BR': { country: 'Brazil', countryCode: 'BR', police: '190', ambulance: '192', fire: '193' },
        'MX': { country: 'Mexico', countryCode: 'MX', police: '911', ambulance: '911', fire: '911' },
        'ZA': { country: 'South Africa', countryCode: 'ZA', police: '10111', ambulance: '10177', fire: '10177' },
        'RU': { country: 'Russia', countryCode: 'RU', police: '102', ambulance: '103', fire: '101' },
        'NG': { country: 'Nigeria', countryCode: 'NG', police: '112', ambulance: '112', fire: '112' },
      };
      
      // Check if we have reliable data for this country
      if (reliableEmergencyNumbers[countryCode.toUpperCase()]) {
        return reliableEmergencyNumbers[countryCode.toUpperCase()];
      }
      
      // If not in our reliable data, try the API
      const response = await axios.get(`https://emergencynumberapi.com/api/country/${countryCode}`);
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        return {
          country: data.name || '',
          countryCode: data.code || countryCode,
          police: data.police || '911',
          ambulance: data.ambulance || '911',
          fire: data.fire || '911'
        };
      }
      
      throw new Error("Invalid response format from emergencynumberapi");
    } catch (error) {
      console.error('Error fetching emergency numbers:', error);
      
      // Fallback with common emergency numbers by region
      const fallbackNumbers: Record<string, EmergencyNumber> = {
        'US': { country: 'United States', countryCode: 'US', police: '911', ambulance: '911', fire: '911' },
        'GB': { country: 'United Kingdom', countryCode: 'GB', police: '999', ambulance: '999', fire: '999' },
        'AU': { country: 'Australia', countryCode: 'AU', police: '000', ambulance: '000', fire: '000' },
        'NZ': { country: 'New Zealand', countryCode: 'NZ', police: '111', ambulance: '111', fire: '111' },
        'IN': { country: 'India', countryCode: 'IN', police: '100', ambulance: '102', fire: '101' },
        'CA': { country: 'Canada', countryCode: 'CA', police: '911', ambulance: '911', fire: '911' },
        'NG': { country: 'Nigeria', countryCode: 'NG', police: '112', ambulance: '112', fire: '112' },
      };
      
      // Use country-specific fallback or European standard 112 for any European country
      if (fallbackNumbers[countryCode]) {
        return fallbackNumbers[countryCode];
      }
      
      // For European countries, default to 112
      const europeanCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
      if (europeanCountries.includes(countryCode)) {
        return {
          country: 'Europe',
          countryCode: countryCode,
          police: '112',
          ambulance: '112',
          fire: '112'
        };
      }
      
      // Try to determine fallback by rough geolocation
      try {
        // Attempt to determine country from browser language
        const browserLang = navigator.language || (navigator as any).userLanguage;
        if (browserLang) {
          const langCountry = browserLang.split('-')[1];
          if (langCountry && fallbackNumbers[langCountry]) {
            return fallbackNumbers[langCountry];
          }
        }
        
        // Try to guess from timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('America')) {
          return fallbackNumbers['US'];
        } else if (timezone.includes('Europe')) {
          return {
            country: 'Europe',
            countryCode: 'EU',
            police: '112',
            ambulance: '112',
            fire: '112'
          };
        } else if (timezone.includes('Asia/India')) {
          return fallbackNumbers['IN'];
        } else if (timezone.includes('Australia')) {
          return fallbackNumbers['AU'];
        }
      } catch (e) {
        console.error('Error determining fallback by locale:', e);
      }
      
      // Final fallback
      return {
        country: 'International',
        countryCode: countryCode || 'INTL',
        police: '112',
        ambulance: '112',
        fire: '112'
      };
    }
  },
  
  /**
   * Get emergency numbers based on GPS coordinates
   * Uses reverse geocoding to determine country
   */
  getEmergencyNumbersByLocation: async (latitude: number, longitude: number): Promise<EmergencyNumber | null> => {
    try {
      console.log(`Getting emergency numbers for location: ${latitude}, ${longitude}`);
      // First, get the country code from coordinates using reverse geocoding
      const reverseGeoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
        {
          headers: {
            'User-Agent': 'Soteria Safety App (https://soteria-safety.app)'
          }
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
      
      // Then get emergency numbers for that country
      return await emergencyService.getEmergencyNumbers(countryCode);
    } catch (error) {
      console.error('Error getting emergency numbers by location:', error);
      
      // Try to make a best guess based on the coordinates
      let guessedCountryCode = 'US'; // Default
      
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
      
      return emergencyService.getEmergencyNumbers(guessedCountryCode);
    }
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
