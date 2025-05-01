
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert } from '@/types/alerts';
import { useAuth } from '@/contexts/AuthContext';
import { threatService } from '@/services/threatService';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAlerts = useCallback(async () => {
    if (!user?.id) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch alerts from Supabase
      const { data: storedAlerts, error: alertsError } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (alertsError) {
        throw alertsError;
      }

      // Try to get real-time threat data as well
      let threatAlerts: Alert[] = [];
      try {
        const recentThreats = await threatService.getRecentThreats(user.id);
        
        // Convert threat alerts to our Alert format
        threatAlerts = recentThreats.map(threat => ({
          id: threat.id,
          title: threat.title,
          description: threat.description,
          severity: convertThreatLevelToSeverity(threat.level),
          category: determineThreatCategory(threat),
          status: threat.resolved ? 'resolved' : 'active',
          createdAt: threat.created_at,
          userId: threat.user_id,
          actionText: threat.action || 'View Details'
        }));
      } catch (threatError) {
        console.error('Error fetching threat alerts:', threatError);
        // Continue execution even if threat fetching fails
      }
      
      // Combine stored alerts with threat alerts
      const formattedAlerts: Alert[] = [
        ...(threatAlerts || []),
        ...(storedAlerts?.map(alert => ({
          id: alert.id,
          title: alert.title,
          description: alert.description,
          severity: alert.severity as Alert['severity'],
          category: alert.category as Alert['category'],
          status: alert.status as Alert['status'],
          createdAt: alert.created_at,
          userId: alert.user_id,
          actionText: alert.action_text,
          actionLink: alert.action_link,
          icon: alert.icon
        })) || [])
      ];

      setAlerts(formattedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to load alerts. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load your alerts.',
        variant: 'destructive'
      });
      
      // Fall back to demo data if in development or if we have no alerts
      if (import.meta.env.DEV) {
        setAlerts(getDemoAlerts());
      }
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updateAlertStatus = useCallback(async (alertId: string, status: AlertStatus) => {
    if (!user?.id) return false;

    try {
      // First check if it's in our alerts table
      const { data, error } = await supabase
        .from('user_alerts')
        .update({ status })
        .eq('id', alertId)
        .eq('user_id', user.id);
      
      if (error) {
        // If not in our table, try resolving it as a threat
        try {
          await threatService.resolveThreat(alertId, user.id);
          setAlerts(prev => 
            prev.map(alert => 
              alert.id === alertId ? { ...alert, status } : alert
            )
          );
          return true;
        } catch (threatError) {
          console.error('Error updating threat status:', threatError);
          throw threatError;
        }
      } else {
        // Update succeeded in our table
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId ? { ...alert, status } : alert
          )
        );
        return true;
      }
    } catch (error) {
      console.error('Error updating alert status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert status.',
        variant: 'destructive'
      });
      return false;
    }
  }, [user, toast]);

  const dismissAlert = useCallback((alertId: string) => {
    return updateAlertStatus(alertId, 'dismissed');
  }, [updateAlertStatus]);

  const resolveAlert = useCallback((alertId: string) => {
    return updateAlertStatus(alertId, 'resolved');
  }, [updateAlertStatus]);
  
  useEffect(() => {
    fetchAlerts();
    
    // Set up real-time listeners for new alerts if user is logged in
    if (user?.id) {
      const alertChannel = supabase
        .channel('user-alerts-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_alerts',
            filter: `user_id=eq.${user.id}` 
          },
          () => {
            fetchAlerts();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(alertChannel);
      };
    }
  }, [user, fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    dismissAlert,
    resolveAlert,
    getFilteredAlerts: (status?: AlertStatus) => {
      if (!status) return alerts;
      return alerts.filter(alert => alert.status === status);
    }
  };
};

// Helper functions
const convertThreatLevelToSeverity = (level: 'low' | 'medium' | 'high'): Alert['severity'] => {
  switch (level) {
    case 'high': return 'critical';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'info';
  }
};

const determineThreatCategory = (threat: any): AlertCategory => {
  if (threat.type === 'cyber') return 'cyber';
  if (threat.type === 'physical') return 'security';
  if (threat.type === 'environmental') return 'environmental';
  
  // Try to determine from the title or description
  const text = (threat.title + ' ' + threat.description).toLowerCase();
  if (text.includes('travel') || text.includes('advisory')) return 'travel';
  if (text.includes('family') || text.includes('check-in')) return 'family';
  if (text.includes('health') || text.includes('medical')) return 'health';
  
  return 'security';
};

// Demo data for development/testing
const getDemoAlerts = (): Alert[] => [
  {
    id: 'demo-1',
    title: 'Low Body Temperature Detected',
    description: 'Low body temperature detected (94.7°F). This could indicate hypothermia or another medical emergency.',
    severity: 'critical',
    category: 'health',
    status: 'active',
    createdAt: new Date().toISOString(),
    userId: 'demo',
    actionText: 'View Details'
  },
  {
    id: 'demo-2',
    title: 'Travel Advisory Update',
    description: 'New travel advisory issued for your upcoming destination (Paris, France). Level 2: Exercise Increased Caution due to terrorism.',
    severity: 'warning',
    category: 'travel',
    status: 'active',
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    userId: 'demo',
    actionText: 'View Advisory'
  },
  {
    id: 'demo-3',
    title: 'Family Check-in Reminder',
    description: 'Sarah hasn\'t checked in for 24 hours. Consider requesting a check-in to verify her status.',
    severity: 'info',
    category: 'family',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    userId: 'demo',
    actionText: 'Request Check-in'
  }
];

export default useAlerts;
