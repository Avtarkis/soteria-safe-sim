
import axios from 'axios';
import { ThreatAlert } from '@/lib/supabase';

export const threatFetcher = {
  // Fetch real-time data from the USGS Earthquake API
  fetchEarthquakeThreats: async (): Promise<ThreatAlert[]> => {
    try {
      const response = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
      return response.data.features.map((feature: any) => {
        const magnitude = feature.properties.mag;
        let level: 'low' | 'medium' | 'high' = 'low';
        
        if (magnitude >= 4.5) level = 'high';
        else if (magnitude >= 3) level = 'medium';
        
        return {
          id: feature.id,
          user_id: 'system',
          title: `M${magnitude.toFixed(1)} Earthquake`,
          description: `${feature.properties.place}. Depth: ${feature.geometry.coordinates[2]} km`,
          level,
          action: 'View Details',
          resolved: false,
          created_at: new Date(feature.properties.time).toISOString(),
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0]
        };
      });
    } catch (error) {
      console.error('Error fetching earthquake data:', error);
      return [];
    }
  },

  // Fetch weather alerts from NWS API
  fetchWeatherAlerts: async (): Promise<ThreatAlert[]> => {
    try {
      const response = await axios.get('https://api.weather.gov/alerts/active?status=actual&message_type=alert');
      
      return response.data.features.slice(0, 10).map((feature: any, index: number) => {
        const severity = feature.properties.severity;
        let level: 'low' | 'medium' | 'high' = 'low';
        
        if (severity === 'Extreme' || severity === 'Severe') level = 'high';
        else if (severity === 'Moderate') level = 'medium';
        
        let latitude = null;
        let longitude = null;
        
        if (feature.geometry && feature.geometry.coordinates && feature.geometry.coordinates.length > 0) {
          if (feature.geometry.type === 'Point') {
            [longitude, latitude] = feature.geometry.coordinates;
          } else if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates[0].length > 0) {
            [longitude, latitude] = feature.geometry.coordinates[0][0];
          }
        }
        
        return {
          id: `weather-${index}-${Date.now()}`,
          user_id: 'system',
          title: feature.properties.event,
          description: feature.properties.headline || 'Weather alert in your area',
          level,
          action: 'See Weather Alert',
          resolved: false,
          created_at: new Date().toISOString(),
          latitude: latitude || (Math.random() * 180 - 90),
          longitude: longitude || (Math.random() * 360 - 180)
        };
      });
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return [];
    }
  }
};
