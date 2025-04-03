import { supabase, ThreatAlert } from '@/lib/supabase';
import { GlobalThreatData, ThreatMarker } from '@/types/threats';
import { threatFetcher } from './threatFetcher';
import { threatConverters } from './threatConverters';
import { sampleThreats } from './sampleThreats';

// Helper to determine if we're in dev mode with no valid Supabase connection
const isDevEnvironment = () => {
  return import.meta.env.DEV && 
    (!import.meta.env.VITE_SUPABASE_URL || 
     import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url'));
};

export const threatService = {
  getUserThreats: async (userId: string, userLocation?: [number, number]) => {
    try {
      let threatAlerts: ThreatAlert[] = [];
      
      const earthquakeThreats = await threatFetcher.fetchEarthquakeThreats();
      const weatherAlerts = await threatFetcher.fetchWeatherAlerts();
      
      threatAlerts = [...earthquakeThreats, ...weatherAlerts];
      
      if (threatAlerts.length > 0) {
        return threatAlerts;
      }
      
      if (isDevEnvironment()) {
        console.log('Development mode or no real data available: Returning mock threat data');
        return sampleThreats.generateSampleThreats(userId, 4);
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
      return sampleThreats.generateSampleThreats(userId, 4);
    }
  },
  
  getGlobalThreatMarkers: async (userLocation?: [number, number]): Promise<ThreatMarker[]> => {
    try {
      const threatAlerts = await threatService.getUserThreats('system');
      
      const threatMarkers: ThreatMarker[] = threatAlerts.map(threat => 
        threatConverters.threatAlertToMarker(threat, userLocation)
      );
      
      if (threatMarkers.length < 5) {
        const additionalThreats = sampleThreats.getAdditionalThreats(userLocation);
        threatMarkers.push(...additionalThreats);
      }
      
      return threatMarkers;
    } catch (error) {
      console.error('Error getting global threat markers:', error);
      
      return sampleThreats.getFallbackThreats(userLocation);
    }
  },
  
  getRecentThreats: async (userId: string, limit = 5) => {
    try {
      let realThreats: ThreatAlert[] = [];
      
      const earthquakeThreats = await threatFetcher.fetchEarthquakeThreats();
      const weatherAlerts = await threatFetcher.fetchWeatherAlerts();
      
      realThreats = [...earthquakeThreats, ...weatherAlerts]
        .filter(threat => !threat.resolved)
        .slice(0, limit);
      
      if (realThreats.length > 0) {
        return realThreats;
      }
      
      if (isDevEnvironment()) {
        console.log('Development mode or no real data available: Returning mock recent threats');
        return sampleThreats.generateSampleThreats(userId, limit).filter(threat => !threat.resolved);
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
      return sampleThreats.generateSampleThreats(userId, limit).filter(threat => !threat.resolved);
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
