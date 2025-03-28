
import { supabase, ThreatAlert } from '@/lib/supabase';

export const threatService = {
  // Get all threats for a user
  getUserThreats: async (userId: string) => {
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
  },
  
  // Get recent threats for a user
  getRecentThreats: async (userId: string, limit = 5) => {
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
  },
  
  // Add a new threat
  addThreat: async (threat: Omit<ThreatAlert, 'id' | 'created_at'>) => {
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
