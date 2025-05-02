
import { useCallback } from 'react';

export const useThreatRefresh = (
  loadThreatMarkers: (forceRefresh?: boolean) => Promise<void>,
  loadDisasterAlerts: (forceRefresh?: boolean) => Promise<any>,
  loadEmergencyServices: (forceRefresh?: boolean) => Promise<any>,
  setRefreshing: (value: boolean) => void,
  handleRefreshCompletion: (success: boolean) => void
) => {
  
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadThreatMarkers(true),
        loadDisasterAlerts(true),
        loadEmergencyServices(true)
      ]);
      
      handleRefreshCompletion(true);
    } catch (error) {
      console.error("Error refreshing data:", error);
      handleRefreshCompletion(false);
    }
  }, [loadThreatMarkers, loadDisasterAlerts, loadEmergencyServices, setRefreshing, handleRefreshCompletion]);

  return {
    handleRefresh
  };
};

export default useThreatRefresh;
