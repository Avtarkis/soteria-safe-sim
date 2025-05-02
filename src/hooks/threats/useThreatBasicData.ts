
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useThreatBasicData = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  // Use refs to track if data has already been loaded
  const userLocationRef = useRef<[number, number] | null>(null);

  const handleRefreshCompletion = useCallback((success: boolean) => {
    setRefreshing(false);
    
    if (success) {
      toast({
        title: "Data Refreshed",
        description: "Where every second counts - threat data has been updated with the latest information."
      });
    } else {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh threat data. Please try again later.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    refreshing,
    setRefreshing,
    userLocationRef,
    handleRefreshCompletion
  };
};

export default useThreatBasicData;
