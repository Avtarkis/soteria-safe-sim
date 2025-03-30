import { supabase, ThreatAlert } from '@/lib/supabase';
import axios from 'axios';

// Helper to determine if we're in dev mode with no valid Supabase connection
const isDevEnvironment = () => {
  return import.meta.env.DEV && 
    (!import.meta.env.VITE_SUPABASE_URL || 
     import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url'));
};

// Fetch real-time data from the USGS Earthquake API
const fetchEarthquakeThreats = async (): Promise<any[]> => {
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
        created_at: new Date(feature.properties.time).toISOString()
      };
    });
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return [];
  }
};

// Fetch weather alerts from NWS API
const fetchWeatherAlerts = async (): Promise<any[]> => {
  try {
    const response = await axios.get('https://api.weather.gov/alerts/active?status=actual&message_type=alert');
    
    return response.data.features.slice(0, 10).map((feature: any, index: number) => {
      const severity = feature.properties.severity;
      let level: 'low' | 'medium' | 'high' = 'low';
      
      if (severity === 'Extreme' || severity === 'Severe') level = 'high';
      else if (severity === 'Moderate') level = 'medium';
      
      return {
        id: `weather-${index}-${Date.now()}`,
        user_id: 'system',
        title: feature.properties.event,
        description: feature.properties.headline || 'Weather alert in your area',
        level,
        action: 'See Weather Alert',
        resolved: false,
        created_at: new Date().toISOString()
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
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      id: '2',
      user_id: userId,
      title: 'High Crime Area Alert',
      description: 'You are entering an area with recent reports of mugging incidents.',
      level: 'medium' as const,
      action: 'View Safe Routes',
      resolved: false,
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    },
    {
      id: '3',
      user_id: userId,
      title: 'Weather Advisory',
      description: 'Flash flood warning in your current location for the next 24 hours.',
      level: 'low' as const,
      action: 'See Details',
      resolved: false,
      created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
    },
    {
      id: '4',
      user_id: userId,
      title: 'Data Breach Detected',
      description: 'Your email was found in a recent data breach. Change your passwords immediately.',
      level: 'high' as const,
      action: 'Change Passwords',
      resolved: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    }
  ];
  
  return threats.slice(0, count);
};

export const threatService = {
  // Get all threats for a user
  getUserThreats: async (userId: string) => {
    try {
      // First try to get real data from public APIs
      let realThreats: ThreatAlert[] = [];
      
      // Combine earthquake and weather data
      const earthquakeThreats = await fetchEarthquakeThreats();
      const weatherAlerts = await fetchWeatherAlerts();
      
      realThreats = [...earthquakeThreats, ...weatherAlerts];
      
      // If we have real threats, return them
      if (realThreats.length > 0) {
        return realThreats;
      }
      
      // If no real data or in development mode, use mock data
      if (isDevEnvironment()) {
        console.log('Development mode or no real data available: Returning mock threat data');
        return generateSampleThreats(userId, 4);
      }
      
      // Try to get data from Supabase
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
      // Fallback to sample data on error
      return generateSampleThreats(userId, 4);
    }
  },
  
  // Get recent threats for a user
  getRecentThreats: async (userId: string, limit = 5) => {
    try {
      // First try to get real data from public APIs
      let realThreats: ThreatAlert[] = [];
      
      // Combine earthquake and weather data
      const earthquakeThreats = await fetchEarthquakeThreats();
      const weatherAlerts = await fetchWeatherAlerts();
      
      realThreats = [...earthquakeThreats, ...weatherAlerts]
        .filter(threat => !threat.resolved)
        .slice(0, limit);
      
      // If we have real threats, return them
      if (realThreats.length > 0) {
        return realThreats;
      }
      
      // If no real data or in development mode, use mock data
      if (isDevEnvironment()) {
        console.log('Development mode or no real data available: Returning mock recent threats');
        return generateSampleThreats(userId, limit).filter(threat => !threat.resolved);
      }
      
      // Try to get data from Supabase
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
      // Fallback to sample data on error
      return generateSampleThreats(userId, limit).filter(threat => !threat.resolved);
    }
  },
  
  // Add a new threat
  addThreat: async (threat: Omit<ThreatAlert, 'id' | 'created_at'>) => {
    // In development mode, return mock data
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
  
  // Mark a threat as resolved
  resolveThreat: async (threatId: string, userId: string) => {
    // In development mode, return mock data
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
  
  // Subscribe to real-time threat updates
  subscribeToThreats: (userId: string, callback: (threat: ThreatAlert) => void) => {
    // In development mode, simulate subscription
    if (isDevEnvironment()) {
      console.log('Development mode: Simulating threat subscription');
      // Return an empty unsubscribe function
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
