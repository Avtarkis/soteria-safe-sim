
import { useCallback } from 'react';
import { useThreatBasicData } from './threats/useThreatBasicData';
import { useThreatRefresh } from './threats/useThreatRefresh';
import { useThreatMarkers } from './useThreatMarkers';
import { useDisasterAlerts } from './useDisasterAlerts';
import { useEmergencyServices } from './useEmergencyServices';

export const useThreatData = (userLocation: [number, number] | null) => {
  // Use the basic data hook
  const { refreshing, setRefreshing, handleRefreshCompletion } = useThreatBasicData();
  
  // Use the split hooks for different data types
  const { loading: markersLoading, threatMarkers, loadThreatMarkers } = useThreatMarkers(userLocation);
  const { disasterAlerts, loadDisasterAlerts, checkForNewAlerts: checkForNewDisasterAlerts } = useDisasterAlerts(userLocation);
  const { emergencyNumbers, countryCode, loadEmergencyServices } = useEmergencyServices(userLocation);

  // Use the refresh hook
  const { handleRefresh } = useThreatRefresh(
    loadThreatMarkers,
    loadDisasterAlerts,
    loadEmergencyServices,
    setRefreshing,
    handleRefreshCompletion
  );

  return {
    loading: markersLoading,
    refreshing,
    threatMarkers,
    disasterAlerts,
    emergencyNumbers,
    countryCode,
    handleRefresh,
    checkForNewDisasterAlerts
  };
};

export default useThreatData;
