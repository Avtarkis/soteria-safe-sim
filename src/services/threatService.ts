
import { supabase, ThreatAlert } from '@/lib/supabase';

class ThreatService {
  async getThreatsForUser(userId: string): Promise<ThreatAlert[]> {
    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(alert => ({
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
        location: { lat: 37.7749, lng: -122.4194 },
        timestamp: alert.created_at,
        source: 'Soteria',
        type: alert.category
      }));
    } catch (error) {
      console.error('Error fetching threats:', error);
      return [];
    }
  }

  async addThreat(threat: Omit<ThreatAlert, 'id'>): Promise<ThreatAlert | null> {
    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .insert([{
          title: threat.title,
          description: threat.description,
          severity: threat.severity,
          category: threat.type,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        severity: data.severity,
        location: threat.location,
        timestamp: data.created_at,
        source: threat.source,
        type: data.category
      };
    } catch (error) {
      console.error('Error adding threat:', error);
      return null;
    }
  }

  subscribeToThreats(userId: string, callback: (threat: ThreatAlert) => void) {
    const subscription = supabase
      .channel('threats')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_alerts',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          const newThreat: ThreatAlert = {
            id: payload.new.id,
            title: payload.new.title,
            description: payload.new.description,
            severity: payload.new.severity,
            location: { lat: 37.7749, lng: -122.4194 },
            timestamp: payload.new.created_at,
            source: 'Soteria',
            type: payload.new.category
          };
          callback(newThreat);
        })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

export const threatService = new ThreatService();
