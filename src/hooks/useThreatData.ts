
import { useState, useCallback, useRef } from 'react';
import { ThreatMarker } from '@/types/threats';
import { useToast } from '@/hooks/use-toast';
import { useDisasterAlerts } from './useDisasterAlerts';
import { useEmergencyServices } from './useEmergencyServices';
import { useThreatMarkers } from './useThreatMarkers';

export const useThreatData = (userLocation: [number, number] | null) => {
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  // Use refs to track if data has already been loaded
  const userLocationRef = useRef<[number, number] | null>(null);

  // Use the split hooks
  const { loading: markersLoading, threatMarkers, loadThreatMarkers } = useThreatMarkers(userLocation);
  const { disasterAlerts, loadDisasterAlerts } = useDisasterAlerts(userLocation);
  const { emergencyNumbers, loadEmergencyServices } = useEmergencyServices(userLocation);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadThreatMarkers(true),
        loadDisasterAlerts(true),
        loadEmergencyServices(true)
      ]);
      
      toast({
        title: "Data Refreshed",
        description: "Where every second counts - threat data has been updated with the latest information."
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh threat data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadThreatMarkers, loadDisasterAlerts, loadEmergencyServices, toast]);

  return {
    loading: markersLoading,
    refreshing,
    threatMarkers,
    disasterAlerts,
    emergencyNumbers,
    handleRefresh
  };
};

export default useThreatData;
