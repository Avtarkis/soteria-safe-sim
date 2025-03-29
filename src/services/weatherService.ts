
import axios from 'axios';

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
