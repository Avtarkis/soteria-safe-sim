
import { useState, useEffect, useCallback } from 'react';
import { DetectionAlert } from '@/types/detection';
import EmergencyResponseSystem from '@/utils/emergency/EmergencyResponseSystem';

export const useMapDetectionEvents = (mapRef: React.RefObject<L.Map>) => {
  const [activeDetectionAlert, setActiveDetectionAlert] = useState<DetectionAlert | null>(null);
  const emergencySystem = EmergencyResponseSystem.getInstance();

  // Listen for weapon detection events and emergency alerts
  useEffect(() => {
    const handleDetectionEvent = (e: CustomEvent) => {
      const alert: DetectionAlert = e.detail;
      
      if (alert) {
        console.log('Weapon detection alert received:', alert);
        setActiveDetectionAlert(alert);
      }
    };

    // Listen for both weapon detection and emergency alerts
    document.addEventListener('weaponDetected', handleDetectionEvent as EventListener);
    
    // Activate the emergency response system
    emergencySystem.activate();
    
    return () => {
      document.removeEventListener('weaponDetected', handleDetectionEvent as EventListener);
    };
  }, [emergencySystem]);

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
  
  // Handle triggering an emergency from the alert
  const handleTriggerEmergency = useCallback(() => {
    if (activeDetectionAlert) {
      // Forward to emergency response system
      emergencySystem.handleManualTrigger('alert');
      handleCloseDetectionAlert();
    }
  }, [activeDetectionAlert, emergencySystem, handleCloseDetectionAlert]);
  
  return {
    activeDetectionAlert,
    handleCloseDetectionAlert,
    handleViewAlertOnMap,
    handleTriggerEmergency
  };
};
