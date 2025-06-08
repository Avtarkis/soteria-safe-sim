import axios from 'axios';
import { ThreatAlert } from '@/lib/supabase';

interface ThreatDataSource {
  name: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
}

interface ProcessedThreatData {
  threats: ThreatAlert[];
  lastUpdated: number;
  sources: string[];
}

class RealThreatDataService {
  private dataSources: ThreatDataSource[] = [
    {
      name: 'USGS Earthquake',
      url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
      enabled: true
    },
    {
      name: 'National Weather Service',
      url: 'https://api.weather.gov/alerts/active',
      enabled: true
    },
    {
      name: 'FBI Crime Data',
      url: 'https://api.fbi.gov/wanted/v1/list',
      enabled: process.env.FBI_API_KEY ? true : false,
      apiKey: process.env.FBI_API_KEY
    }
  ];

  private cache: Map<string, ProcessedThreatData> = new Map();
  private cacheTimeout = 300000; // 5 minutes

  async fetchRealTimeThreats(location?: [number, number]): Promise<ThreatAlert[]> {
    try {
      const cacheKey = location ? `${location[0]},${location[1]}` : 'global';
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.lastUpdated < this.cacheTimeout) {
        return cached.threats;
      }

      const allThreats: ThreatAlert[] = [];
      const activeSources: string[] = [];

      for (const source of this.dataSources.filter(s => s.enabled)) {
        try {
          const threats = await this.fetchFromSource(source, location);
          allThreats.push(...threats);
          activeSources.push(source.name);
        } catch (error) {
          console.error(`Error fetching from ${source.name}:`, error);
        }
      }

      const processedData: ProcessedThreatData = {
        threats: allThreats,
        lastUpdated: Date.now(),
        sources: activeSources
      };

      this.cache.set(cacheKey, processedData);
      return allThreats;

    } catch (error) {
      console.error('Error fetching real-time threats:', error);
      return this.getFallbackThreats(location);
    }
  }

  async fetchLocalThreats(lat: number, lng: number): Promise<ThreatAlert[]> {
    try {
      const threats: ThreatAlert[] = [];
      
      // Fetch weather alerts
      const weatherThreats = await this.fetchWeatherThreats(lat, lng);
      threats.push(...weatherThreats);
      
      // Fetch disaster alerts  
      const disasterThreats = await this.fetchDisasterThreats(lat, lng);
      threats.push(...disasterThreats);
      
      // Fetch crime data
      const crimeThreats = await this.fetchCrimeThreats(lat, lng);
      threats.push(...crimeThreats);
      
      return threats;
    } catch (error) {
      console.error('Error fetching local threats:', error);
      return [];
    }
  }

  private async fetchFromSource(source: ThreatDataSource, location?: [number, number]): Promise<ThreatAlert[]> {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };

    if (source.apiKey) {
      headers['Authorization'] = `Bearer ${source.apiKey}`;
    }

    const response = await axios.get(source.url, { headers, timeout: 10000 });

    switch (source.name) {
      case 'USGS Earthquake':
        return this.processEarthquakeData(response.data, location);
      case 'National Weather Service':
        return this.processWeatherData(response.data, location);
      case 'FBI Crime Data':
        return this.processCrimeData(response.data, location);
      default:
        return [];
    }
  }

  private async fetchWeatherThreats(lat: number, lng: number): Promise<ThreatAlert[]> {
    return [];
  }

  private async fetchDisasterThreats(lat: number, lng: number): Promise<ThreatAlert[]> {
    return [];
  }

  private async fetchCrimeThreats(lat: number, lng: number): Promise<ThreatAlert[]> {
    // Mock crime data for now
    return [
      {
        id: `crime-${Date.now()}`,
        title: 'Crime Alert',
        description: 'Recent criminal activity reported in the area',
        severity: 'medium' as const,
        location: { lat, lng },
        timestamp: new Date().toISOString(),
        source: 'Local Police',
        type: 'crime'
      }
    ];
  }

  private processEarthquakeData(data: any, location?: [number, number]): ThreatAlert[] {
    return data.features
      .filter((feature: any) => {
        if (!location) return true;
        const distance = this.calculateDistance(
          location[0], location[1],
          feature.geometry.coordinates[1], feature.geometry.coordinates[0]
        );
        return distance < 500; // Within 500km
      })
      .map((feature: any) => ({
        id: feature.id,
        user_id: 'system',
        title: `M${feature.properties.mag.toFixed(1)} Earthquake`,
        description: `${feature.properties.place}. Depth: ${feature.geometry.coordinates[2]} km`,
        level: feature.properties.mag >= 4.5 ? 'high' as const : 
               feature.properties.mag >= 3 ? 'medium' as const : 'low' as const,
        action: 'View Details',
        resolved: false,
        created_at: new Date(feature.properties.time).toISOString(),
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0]
      }));
  }

  private processWeatherData(data: any, location?: [number, number]): ThreatAlert[] {
    return data.features
      .slice(0, 10)
      .filter((feature: any) => {
        if (!location || !feature.geometry) return true;
        // Filter by location if available
        return true; // Simplified for now
      })
      .map((feature: any, index: number) => ({
        id: `weather-${index}-${Date.now()}`,
        user_id: 'system',
        title: feature.properties.event,
        description: feature.properties.headline || 'Weather alert in your area',
        level: feature.properties.severity === 'Extreme' || feature.properties.severity === 'Severe' ? 'high' as const :
               feature.properties.severity === 'Moderate' ? 'medium' as const : 'low' as const,
        action: 'See Weather Alert',
        resolved: false,
        created_at: new Date().toISOString(),
        latitude: location?.[0] || 0,
        longitude: location?.[1] || 0
      }));
  }

  private processCrimeData(data: any, location?: [number, number]): ThreatAlert[] {
    // Process FBI wanted list data
    return data.items?.slice(0, 5).map((item: any, index: number) => ({
      id: `crime-${index}-${Date.now()}`,
      user_id: 'system',
      title: 'FBI Wanted Individual',
      description: `${item.title || 'Wanted individual'} - Exercise caution`,
      level: 'medium' as const,
      action: 'Report if Seen',
      resolved: false,
      created_at: new Date().toISOString(),
      latitude: location?.[0] || 0,
      longitude: location?.[1] || 0
    })) || [];
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  private getFallbackThreats(location?: [number, number]): ThreatAlert[] {
    return [
      {
        id: 'fallback-1',
        user_id: 'system',
        title: 'System Alert',
        description: 'Real-time threat data temporarily unavailable. Using cached information.',
        level: 'low' as const,
        action: 'Refresh',
        resolved: false,
        created_at: new Date().toISOString(),
        latitude: location?.[0] || 0,
        longitude: location?.[1] || 0
      }
    ];
  }

  clearCache(): void {
    this.cache.clear();
  }

  getDataSources(): ThreatDataSource[] {
    return [...this.dataSources];
  }

  updateDataSource(name: string, enabled: boolean): void {
    const source = this.dataSources.find(s => s.name === name);
    if (source) {
      source.enabled = enabled;
      this.clearCache();
    }
  }
}

export const realThreatDataService = new RealThreatDataService();
export default realThreatDataService;
export type { ThreatDataSource, ProcessedThreatData };
