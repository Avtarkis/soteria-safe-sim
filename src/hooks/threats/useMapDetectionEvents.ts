
import { useState, useEffect, useCallback } from 'react';
import { DetectionAlert } from '@/types/detection';

export const useMapDetectionEvents = (mapRef: React.RefObject<L.Map>) => {
  const [activeDetectionAlert, setActiveDetectionAlert] = useState<DetectionAlert | null>(null);

  // Listen for weapon detection events
  useEffect(() => {
    const handleDetectionEvent = (e: CustomEvent) => {
      const alert: DetectionAlert = e.detail;
      
      if (alert) {
        console.log('Weapon detection alert received:', alert);
        setActiveDetectionAlert(alert);
      }
    };

    document.addEventListener('weaponDetected', handleDetectionEvent as EventListener);
    
    return () => {
      document.removeEventListener('weaponDetected', handleDetectionEvent as EventListener);
    };
  }, []);

  // Handle closing the detection alert
  const handleCloseDetectionAlert = useCallback(() => {
    setActiveDetectionAlert(null);
  }, []);

  // Handle viewing the alert on the map
  const handleViewAlertOnMap = useCallback(() => {
    if (activeDetectionAlert?.location && mapRef.current) {
      mapRef.current.setView(activeDetectionAlert.location, 18);
      handleCloseDetectionAlert();
    }
  }, [activeDetectionAlert, mapRef, handleCloseDetectionAlert]);
  
  return {
    activeDetectionAlert,
    handleCloseDetectionAlert,
    handleViewAlertOnMap
  };
};
