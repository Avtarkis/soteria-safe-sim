
import axios from 'axios';

const FBI_API_KEY = 't5NXacoA61wMeasAq8XciJB9hhV0zYBsGb6WBNEM';
const FBI_BASE_URL = 'https://api.usa.gov/crime/fbi/sapi';

export interface CrimeData {
  data: {
    offense: string;
    count: number;
    year: number;
  }[];
  pagination: {
    count: number;
    page: number;
    pages: number;
    per_page: number;
  };
}

export interface LocationCrimeStats {
  location: string;
  ori: string;
  lat: number;
  lng: number;
  crimeSummary: {
    violent: number;
    property: number;
    total: number;
  };
  details: string;
}

// Major US cities with approximate coordinates and ori codes
const MAJOR_CITIES: { [key: string]: { lat: number; lng: number; ori: string } } = {
  'New York': { lat: 40.7128, lng: -74.0060, ori: 'NY0303000' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, ori: 'CA0194200' },
  'Chicago': { lat: 41.8781, lng: -87.6298, ori: 'IL0160100' },
  'Houston': { lat: 29.7604, lng: -95.3698, ori: 'TX1010100' },
  'Philadelphia': { lat: 39.9526, lng: -75.1652, ori: 'PA0510100' },
  'Phoenix': { lat: 33.4484, lng: -112.0740, ori: 'AZ0072100' },
  'San Antonio': { lat: 29.4241, lng: -98.4936, ori: 'TX0150100' },
  'San Diego': { lat: 32.7157, lng: -117.1611, ori: 'CA0731100' },
  'Dallas': { lat: 32.7767, lng: -96.7970, ori: 'TX0570100' },
  'San Francisco': { lat: 37.7749, lng: -122.4194, ori: 'CA0380100' }
};

export const crimeService = {
  // Get crime data for a specific location (identified by ORI)
  getCrimesByOri: async (ori: string, offense = 'violent-crime,property-crime', from = 2020, to = 2022): Promise<CrimeData> => {
    try {
      const response = await axios.get(`${FBI_BASE_URL}/api/summarized/agencies/${ori}/offenses/${from}/${to}`, {
        params: {
          api_key: FBI_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching crime data for ORI ${ori}:`, error);
      throw error;
    }
  },

  // Get crimes for all major cities and format as threat markers
  getCrimeThreats: async (): Promise<ThreatMarker[]> => {
    try {
      const threats: ThreatMarker[] = [];
      const crimeStats: LocationCrimeStats[] = [];
      
      // Gather crime statistics for all major cities
      for (const [city, info] of Object.entries(MAJOR_CITIES)) {
        try {
          const data = await crimeService.getCrimesByOri(info.ori);
          
          // Calculate summary statistics
          let violent = 0;
          let property = 0;
          
          data.data.forEach(item => {
            if (item.offense === 'violent-crime') {
              violent += item.count;
            } else if (item.offense === 'property-crime') {
              property += item.count;
            }
          });
          
          const total = violent + property;
          const crimeRate = total / 3; // Averaging over 3 years
          
          crimeStats.push({
            location: city,
            ori: info.ori,
            lat: info.lat,
            lng: info.lng,
            crimeSummary: {
              violent,
              property, 
              total
            },
            details: `${city} has reported ${violent} violent crimes and ${property} property crimes over the last 3 years.`
          });
        } catch (error) {
          console.error(`Error processing crime data for ${city}:`, error);
        }
      }
      
      // Convert crime statistics to threat markers
      crimeStats.forEach(stat => {
        // Determine threat level based on crime rate
        let level: 'low' | 'medium' | 'high' = 'low';
        const total = stat.crimeSummary.total;
        
        if (total > 50000) {
          level = 'high';
        } else if (total > 20000) {
          level = 'medium';
        }
        
        threats.push({
          id: `crime-${stat.ori}`,
          position: [stat.lat, stat.lng],
          level,
          title: `Crime Alert: ${stat.location}`,
          details: stat.details,
          type: 'physical'
        });
      });
      
      return threats;
    } catch (error) {
      console.error('Error processing crime threats:', error);
      return [];
    }
  }
};
