
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
    
    // Set up real-time subscription to new threats
    const unsubscribe = threatService.subscribeToThreats(user.id, (newThreat) => {
      // Show a toast notification when a new threat is detected
      toast({
        title: `New ${newThreat.level} level threat detected`,
        description: newThreat.title,
        variant: newThreat.level === 'high' ? 'destructive' : 'default',
      });
      
      // If browser notifications are supported and permitted, show one
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Soteria Security Alert', {
          body: `${newThreat.title}: ${newThreat.description}`,
          icon: '/lovable-uploads/fd116965-8e8a-49e6-8cd8-3c8032d4d789.png',
        });
      }
    });
    
    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    return () => {
      unsubscribe();
    };
  }, [user, toast]);
  
  // Method to manually add a threat (mostly for testing)
  const addThreat = async (threat: Omit<ThreatAlert, 'id' | 'created_at' | 'user_id' | 'resolved'>) => {
    if (!user) return null;
    
    try {
      return await threatService.addThreat({
        ...threat,
        user_id: user.id,
        resolved: false,
      });
    } catch (error) {
      console.error('Error adding test threat:', error);
      return null;
    }
  };
  
  return { addThreat };
}
