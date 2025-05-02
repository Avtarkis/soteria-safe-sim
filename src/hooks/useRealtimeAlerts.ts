
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useRealtimeAlerts = (userId: string | undefined, onAlertsChange: () => void) => {
  useEffect(() => {
    // Set up real-time listeners for new alerts if user is logged in
    if (userId) {
      const alertChannel = supabase
        .channel('user-alerts-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_alerts',
            filter: `user_id=eq.${userId}` 
          },
          () => {
            onAlertsChange();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(alertChannel);
      };
    }
  }, [userId, onAlertsChange]);
};

export default useRealtimeAlerts;
