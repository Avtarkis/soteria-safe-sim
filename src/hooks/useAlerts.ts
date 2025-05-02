
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Alert, AlertStatus } from '@/types/alerts';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserAlerts } from '@/services/alertsService';
import { updateAlertStatus } from '@/services/alertsService';
import { getDemoAlerts } from '@/services/alertsService';
import { useRealtimeAlerts } from './useRealtimeAlerts';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Set up realtime subscription for alerts
  useRealtimeAlerts(user?.id, fetchAlerts);

  // Function to fetch alerts from different sources and combine them
  const fetchAlerts = useCallback(async () => {
    if (!user?.id) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { storedAlerts, threatAlerts } = await fetchUserAlerts(user.id);
      
      // Combine stored alerts with threat alerts
      const formattedAlerts: Alert[] = [
        ...(threatAlerts || []),
        ...((storedAlerts as any[]) || []).map(alert => ({
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
        }))
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

  // Function to update alert status
  const handleUpdateAlertStatus = useCallback(async (alertId: string, status: AlertStatus) => {
    if (!user?.id) return false;

    try {
      await updateAlertStatus(alertId, status, user.id);
      
      // Update the UI state
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, status } : alert
        )
      );
      return true;
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
    return handleUpdateAlertStatus(alertId, 'dismissed');
  }, [handleUpdateAlertStatus]);

  const resolveAlert = useCallback((alertId: string) => {
    return handleUpdateAlertStatus(alertId, 'resolved');
  }, [handleUpdateAlertStatus]);
  
  useEffect(() => {
    fetchAlerts();
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

export default useAlerts;
