
import { useEffect } from 'react';
import { threatService } from '@/services/threatService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ThreatAlert } from '@/lib/supabase';

export function useThreatNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = threatService.subscribeToThreats(user.id, (newThreat) => {
      toast({
        title: `New ${newThreat.severity} level threat detected`,
        description: newThreat.title,
        variant: newThreat.severity === 'high' || newThreat.severity === 'critical' ? 'destructive' : 'default',
      });
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Soteria Security Alert', {
          body: `${newThreat.title}: ${newThreat.description}`,
          icon: '/lovable-uploads/fd116965-8e8a-49e6-8cd8-3c8032d4d789.png',
        });
      }
    });
    
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    return () => {
      unsubscribe();
    };
  }, [user, toast]);
  
  const addThreat = async (threat: Omit<ThreatAlert, 'id' | 'timestamp'>) => {
    if (!user) return null;
    
    try {
      return await threatService.addThreat({
        ...threat,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding test threat:', error);
      return null;
    }
  };
  
  return { addThreat };
}
