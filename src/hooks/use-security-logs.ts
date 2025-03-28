
import { useState, useEffect } from 'react';
import { supabase, SecurityLog } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useSecurityLogs() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLogs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (eventType: string, details: Record<string, unknown>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .insert({
          event_type: eventType,
          details,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state with new log
      setLogs(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding security log:', error);
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [user]);

  return { logs, loading, addLog, refreshLogs: fetchLogs };
}
