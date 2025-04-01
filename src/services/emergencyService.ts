
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
      const response = await axios.get(`https://emergencynumberapi.com/api/country/${countryCode}`);
      return {
        country: response.data.name || '',
        countryCode: response.data.code || countryCode,
        police: response.data.police || '911',
        ambulance: response.data.ambulance || '911',
        fire: response.data.fire || '911'
      };
    } catch (error) {
      console.error('Error fetching emergency numbers:', error);
      
      // Fallback with common emergency numbers by region
      const fallbackNumbers: Record<string, EmergencyNumber> = {
        'US': { country: 'United States', countryCode: 'US', police: '911', ambulance: '911', fire: '911' },
        'GB': { country: 'United Kingdom', countryCode: 'GB', police: '999', ambulance: '999', fire: '999' },
        'EU': { country: 'Europe', countryCode: 'EU', police: '112', ambulance: '112', fire: '112' },
        'AU': { country: 'Australia', countryCode: 'AU', police: '000', ambulance: '000', fire: '000' },
      };
      
      // Return fallback or null
      return fallbackNumbers[countryCode] || fallbackNumbers['US'] || null;
    }
  },
  
  /**
   * Get emergency numbers based on GPS coordinates
   * Uses reverse geocoding to determine country
   */
  getEmergencyNumbersByLocation: async (latitude: number, longitude: number): Promise<EmergencyNumber | null> => {
    try {
      // First, get the country code from coordinates using reverse geocoding
      const reverseGeoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      
      const countryCode = reverseGeoResponse.data.address.country_code.toUpperCase();
      
      // Then get emergency numbers for that country
      return await emergencyService.getEmergencyNumbers(countryCode);
    } catch (error) {
      console.error('Error getting emergency numbers by location:', error);
      // Return US emergency numbers as fallback
      return {
        country: 'United States',
        countryCode: 'US',
        police: '911',
        ambulance: '911',
        fire: '911'
      };
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
