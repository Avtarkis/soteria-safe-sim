import { supabase, ThreatAlert } from '@/lib/supabase';
import axios from 'axios';
import { GlobalThreatData, ThreatMarker } from '@/types/threats';

// Helper to determine if we're in dev mode with no valid Supabase connection
const isDevEnvironment = () => {
  return import.meta.env.DEV && 
    (!import.meta.env.VITE_SUPABASE_URL || 
     import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url'));
};

// Fetch real-time data from the USGS Earthquake API
const fetchEarthquakeThreats = async (): Promise<ThreatAlert[]> => {
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
};

// Fetch weather alerts from NWS API
const fetchWeatherAlerts = async (): Promise<ThreatAlert[]> => {
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
        latitude: latitude || (feature.properties.geocode?.UGC?.[0] ? null : null),
        longitude: longitude || (feature.properties.geocode?.UGC?.[0] ? null : null)
      };
    });
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    return [];
  }
};

// Generate sample threats for development or fallback
const generateSampleThreats = (userId: string, count = 3): ThreatAlert[] => {
  const threats = [
    {
      id: '1',
      user_id: userId,
      title: 'Suspicious Login Attempt',
      description: 'Someone tried to log into your account from an unrecognized device in Moscow, Russia.',
      level: 'high' as const,
      action: 'Secure Account',
      resolved: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: '2',
      user_id: userId,
      title: 'High Crime Area Alert',
      description: 'You are entering an area with recent reports of mugging incidents.',
      level: 'medium' as const,
      action: 'View Safe Routes',
      resolved: false,
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    },
    {
      id: '3',
      user_id: userId,
      title: 'Weather Advisory',
      description: 'Flash flood warning in your current location for the next 24 hours.',
      level: 'low' as const,
      action: 'See Details',
      resolved: false,
      created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString()
    },
    {
      id: '4',
      user_id: userId,
      title: 'Data Breach Detected',
      description: 'Your email was found in a recent data breach. Change your passwords immediately.',
      level: 'high' as const,
      action: 'Change Passwords',
      resolved: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
  ];
  
  return threats.slice(0, count);
};

// Convert a ThreatAlert to a ThreatMarker for map display
const threatAlertToMarker = (threat: ThreatAlert, userLocation?: [number, number]): ThreatMarker => {
  if (threat.latitude && threat.longitude) {
    return {
      id: threat.id,
      position: [threat.latitude, threat.longitude] as [number, number],
      level: threat.level as 'low' | 'medium' | 'high',
      title: threat.title,
      details: threat.description,
      type: 'environmental'
    };
  }
  
  const baseLocation: [number, number] = userLocation || [37.7749, -122.4194];
  const randomOffset = () => (Math.random() - 0.5) * 5;
  
  let type: 'cyber' | 'physical' | 'environmental' = 'environmental';
  
  const threatText = (threat.title + ' ' + threat.description).toLowerCase();
  if (threatText.includes('hack') || threatText.includes('breach') || threatText.includes('cyber') || 
      threatText.includes('ransomware') || threatText.includes('data') || threatText.includes('password')) {
    type = 'cyber';
  } else if (threatText.includes('crime') || threatText.includes('theft') || threatText.includes('robbery') || 
             threatText.includes('assault') || threatText.includes('traffic') || threatText.includes('incident')) {
    type = 'physical';
  }
  
  return {
    id: threat.id,
    position: [baseLocation[0] + randomOffset(), baseLocation[1] + randomOffset()] as [number, number],
    level: threat.level as 'low' | 'medium' | 'high',
    title: threat.title,
    details: threat.description,
    type
  };
};

export const threatService = {
  getUserThreats: async (userId: string, userLocation?: [number, number]) => {
    try {
      let threatAlerts: ThreatAlert[] = [];
      
      const earthquakeThreats = await fetchEarthquakeThreats();
      const weatherAlerts = await fetchWeatherAlerts();
      
      threatAlerts = [...earthquakeThreats, ...weatherAlerts];
      
      if (threatAlerts.length > 0) {
        return threatAlerts;
      }
      
      if (isDevEnvironment()) {
        console.log('Development mode or no real data available: Returning mock threat data');
        return generateSampleThreats(userId, 4);
      }
      
      const { data, error } = await supabase
        .from('threat_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching threats:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getUserThreats:', error);
      return generateSampleThreats(userId, 4);
    }
  },
  
  getGlobalThreatMarkers: async (userLocation?: [number, number]): Promise<ThreatMarker[]> => {
    try {
      const threatAlerts = await threatService.getUserThreats('system');
      
      const threatMarkers: ThreatMarker[] = threatAlerts.map(threat => 
        threatAlertToMarker(threat, userLocation)
      );
      
      if (threatMarkers.length < 5) {
        const additionalThreats: ThreatMarker[] = [
          {
            id: 'cyber-1',
            position: userLocation ? [userLocation[0] + 0.2, userLocation[1] + 0.3] : [37.7749, -122.4194],
            level: 'high',
            title: 'DDoS Attack',
            details: 'Major distributed denial of service attack targeting tech companies in this region.',
            type: 'cyber'
          },
          {
            id: 'cyber-2',
            position: userLocation ? [userLocation[0] - 0.1, userLocation[1] - 0.2] : [40.7128, -74.006],
            level: 'medium',
            title: 'Ransomware Alert',
            details: 'Financial institutions reporting ransomware attempts. Implement security protocols.',
            type: 'cyber'
          },
          {
            id: 'physical-1',
            position: userLocation ? [userLocation[0] + 0.05, userLocation[1] - 0.15] : [34.0522, -118.2437],
            level: 'medium',
            title: 'Street Crime Warning',
            details: 'Recent increase in street theft and muggings reported in this neighborhood.',
            type: 'physical'
          }
        ];
        
        threatMarkers.push(...additionalThreats);
      }
      
      return threatMarkers;
    } catch (error) {
      console.error('Error getting global threat markers:', error);
      
      return [
        {
          id: '1',
          position: userLocation ? [userLocation[0] + 0.1, userLocation[1] - 0.1] : [37.7749, -122.4194],
          level: 'high',
          title: 'Data Breach Alert',
          details: 'Major data breach reported in this area affecting financial institutions.',
          type: 'cyber'
        },
        {
          id: '2',
          position: userLocation ? [userLocation[0] - 0.05, userLocation[1] + 0.05] : [34.0522, -118.2437],
          level: 'medium',
          title: 'Street Crime Warning',
          details: 'Recent increase in street theft and muggings reported in this neighborhood.',
          type: 'physical'
        },
        {
          id: '3',
          position: userLocation ? [userLocation[0], userLocation[1] + 0.2] : [51.5074, -0.1278],
          level: 'low',
          title: 'Weather Advisory',
          details: 'Potential flooding in low-lying areas due to heavy rainfall forecast.',
          type: 'environmental'
        }
      ];
    }
  },
  
  getRecentThreats: async (userId: string, limit = 5) => {
    try {
      let realThreats: ThreatAlert[] = [];
      
      const earthquakeThreats = await fetchEarthquakeThreats();
      const weatherAlerts = await fetchWeatherAlerts();
      
      realThreats = [...earthquakeThreats, ...weatherAlerts]
        .filter(threat => !threat.resolved)
        .slice(0, limit);
      
      if (realThreats.length > 0) {
        return realThreats;
      }
      
      if (isDevEnvironment()) {
        console.log('Development mode or no real data available: Returning mock recent threats');
        return generateSampleThreats(userId, limit).filter(threat => !threat.resolved);
      }
      
      const { data, error } = await supabase
        .from('threat_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching recent threats:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getRecentThreats:', error);
      return generateSampleThreats(userId, limit).filter(threat => !threat.resolved);
    }
  },
  
  addThreat: async (threat: Omit<ThreatAlert, 'id' | 'created_at'>) => {
    if (isDevEnvironment()) {
      console.log('Development mode: Simulating adding a threat');
      const newThreat = {
        ...threat,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      return newThreat;
    }
    
    const { data, error } = await supabase
      .from('threat_alerts')
      .insert(threat)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding threat:', error);
      throw error;
    }
    
    return data;
  },
  
  resolveThreat: async (threatId: string, userId: string) => {
    if (isDevEnvironment()) {
      console.log('Development mode: Simulating resolving a threat');
      const resolvedThreat = {
        id: threatId,
        user_id: userId,
        title: 'Resolved Threat',
        description: 'This threat has been resolved',
        level: 'low' as const,
        resolved: true,
        created_at: new Date().toISOString()
      };
      return resolvedThreat;
    }
    
    const { data, error } = await supabase
      .from('threat_alerts')
      .update({ resolved: true })
      .eq('id', threatId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error resolving threat:', error);
      throw error;
    }
    
    return data;
  },
  
  subscribeToThreats: (userId: string, callback: (threat: ThreatAlert) => void) => {
    if (isDevEnvironment()) {
      console.log('Development mode: Simulating threat subscription');
      return () => {};
    }
    
    const subscription = supabase
      .channel('threat_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'threat_alerts',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as ThreatAlert);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }
};
