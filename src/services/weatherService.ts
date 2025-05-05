
import axios from 'axios';
import { ThreatMarker } from '@/types/threats';
import { DisasterAlert, DisasterAlertType, DisasterAlertSeverity } from '@/types/disasters';

const WEATHER_API_KEY = '46d2a8c903cd4739b4373344252903';
const WEATHER_BASE_URL = 'https://api.weatherapi.com/v1';

export interface WeatherAlert {
  headline: string;
  severity: string;
  urgency: string;
  areas: string;
  event: string;
  note: string;
  effective: string; 
  expires: string;
  desc: string;
  instruction: string;
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_mph: number;
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
  };
  forecast?: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
      hour: {
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        chance_of_rain: number;
      }[];
    }[];
  };
  alerts?: {
    alert: WeatherAlert[];
  };
}

export const weatherService = {
  getCurrentWeather: async (location: string): Promise<WeatherData> => {
    try {
      const response = await axios.get(`${WEATHER_BASE_URL}/current.json`, {
        params: {
          key: WEATHER_API_KEY,
          q: location,
          aqi: 'no'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },

  getForecastWeather: async (location: string, days: number = 3): Promise<WeatherData> => {
    try {
      const response = await axios.get(`${WEATHER_BASE_URL}/forecast.json`, {
        params: {
          key: WEATHER_API_KEY,
          q: location,
          days,
          aqi: 'no',
          alerts: 'yes'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      throw error;
    }
  },

  getWeatherAlerts: async (location: string): Promise<WeatherAlert[]> => {
    try {
      const response = await axios.get(`${WEATHER_BASE_URL}/forecast.json`, {
        params: {
          key: WEATHER_API_KEY,
          q: location,
          days: 1,
          alerts: 'yes'
        }
      });
      
      return response.data.alerts?.alert || [];
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw error;
    }
  },

  /**
   * Transform weather alerts to disaster alerts format for unified display
   */
  transformWeatherAlertsToDisasterAlerts: async (location: string): Promise<DisasterAlert[]> => {
    try {
      const data = await weatherService.getForecastWeather(location);
      const alerts = data.alerts?.alert || [];
      
      return alerts.map((alert, index) => {
        // Map severity
        let severity: DisasterAlertSeverity = 'advisory';
        if (alert.severity.toLowerCase().includes('severe') || 
            alert.severity.toLowerCase().includes('extreme') || 
            alert.severity.toLowerCase().includes('warning')) {
          severity = 'warning';
        } else if (alert.severity.toLowerCase().includes('moderate') || 
                  alert.severity.toLowerCase().includes('watch')) {
          severity = 'watch';
        }
        
        // Map type
        let type: DisasterAlertType = 'storm';
        const eventLower = alert.event.toLowerCase();
        if (eventLower.includes('flood')) {
          type = 'flood';
        } else if (eventLower.includes('heat') || eventLower.includes('temperature')) {
          type = 'extreme_heat';
        } else if (eventLower.includes('fire') || eventLower.includes('wildfire')) {
          type = 'wildfire';
        } else if (eventLower.includes('earthquake')) {
          type = 'earthquake';
        }
        
        return {
          id: `weather-${data.location.name.replace(/\s/g, '-')}-${index}`,
          title: alert.event,
          type,
          severity,
          location: alert.areas || data.location.name,
          coordinates: [data.location.lat, data.location.lon],
          description: alert.desc || `${alert.headline}: ${alert.note}`,
          date: alert.effective || new Date().toISOString(),
          source: 'Weather API',
          active: true,
          country: data.location.country,
          region: data.location.region,
          url: undefined
        };
      });
    } catch (error) {
      console.error('Error transforming weather alerts:', error);
      return [];
    }
  },

  /**
   * Get safe routes based on weather and EONET data
   * This will avoid areas with severe weather or natural disasters
   */
  getSafeRoutes: async (start: [number, number], end: [number, number], disasters: DisasterAlert[]): Promise<{
    route: [number, number][];
    isSafe: boolean;
    warnings: string[];
  }> => {
    // In a real implementation, this would call a routing API and avoid disaster areas
    // For now, we'll simulate a route and check if it passes through disaster areas
    
    // Create a simple direct route (straight line with some intermediate points)
    const route: [number, number][] = [
      start,
      [
        start[0] + (end[0] - start[0]) * 0.25,
        start[1] + (end[1] - start[1]) * 0.25
      ],
      [
        start[0] + (end[0] - start[0]) * 0.5,
        start[1] + (end[1] - start[1]) * 0.5
      ],
      [
        start[0] + (end[0] - start[0]) * 0.75,
        start[1] + (end[1] - start[1]) * 0.75
      ],
      end
    ];
    
    // Check if route passes near any disaster areas
    const warnings: string[] = [];
    let isSafe = true;
    
    for (const point of route) {
      for (const disaster of disasters) {
        if (!disaster.coordinates) continue;
        
        // Calculate distance between route point and disaster
        const distance = calculateDistance(
          point[0], 
          point[1], 
          disaster.coordinates[0], 
          disaster.coordinates[1]
        );
        
        // If within 50km of a severe disaster, consider route unsafe
        if (distance < 50 && disaster.severity === 'warning') {
          warnings.push(`Route passes within 50km of ${disaster.title} (${disaster.location})`);
          isSafe = false;
        }
        // If within 20km of any disaster, add a warning
        else if (distance < 20) {
          warnings.push(`Route passes within 20km of ${disaster.title} (${disaster.location})`);
        }
      }
    }
    
    return {
      route,
      isSafe,
      warnings
    };
  },

  // Convert weather alerts to threat markers for the map
  getWeatherThreats: async (locations: string[]): Promise<ThreatMarker[]> => {
    try {
      const threats: ThreatMarker[] = [];
      
      // Process each location
      for (const location of locations) {
        const weatherData = await weatherService.getCurrentWeather(location);
        const alerts = await weatherService.getWeatherAlerts(location);
        
        // If there are alerts, create threat markers
        if (alerts && alerts.length > 0) {
          for (const alert of alerts) {
            // Determine threat level based on severity
            let level: 'low' | 'medium' | 'high' = 'low';
            if (alert.severity === 'Moderate' || alert.severity === 'Possible') {
              level = 'medium';
            } else if (alert.severity === 'Severe' || alert.severity === 'Extreme') {
              level = 'high';
            }
            
            threats.push({
              id: `weather-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              position: [weatherData.location.lat, weatherData.location.lon],
              level,
              title: alert.event,
              details: alert.desc,
              type: 'environmental'
            });
          }
        }
      }
      
      return threats;
    } catch (error) {
      console.error('Error processing weather threats:', error);
      return [];
    }
  }
};

// Helper function to calculate distance between two coordinates in kilometers (using Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in kilometers
  return distance;
}
