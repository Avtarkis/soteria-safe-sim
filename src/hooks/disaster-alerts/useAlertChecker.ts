
import { useState } from 'react';
import { DisasterAlert } from '@/types/disasters';
import { reliefWebService } from '@/services/reliefWebService';
import { useToast } from '@/hooks/use-toast';

export const useAlertChecker = (userLocation: [number, number] | null) => {
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toISOString());
  const { toast } = useToast();

  const checkForNewAlerts = async (
    userCountry?: string
  ): Promise<boolean> => {
    try {
      const newAlerts = await reliefWebService.checkForNewAlerts(lastCheckTime, userCountry);
      setLastCheckTime(new Date().toISOString());
      
      if (newAlerts.length > 0) {
        const highPriorityAlerts = newAlerts.filter(alert => alert.severity === 'warning');
        
        if (highPriorityAlerts.length > 0) {
          toast({
            title: "Urgent Humanitarian Alert",
            description: highPriorityAlerts[0].title,
            variant: "destructive"
          });
        } else {
          toast({
            title: "New Humanitarian Alert",
            description: `${newAlerts[0].title} - ${newAlerts[0].location}`,
          });
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for new disaster alerts:', error);
      return false;
    }
  };

  return {
    lastCheckTime,
    checkForNewAlerts,
  };
};
