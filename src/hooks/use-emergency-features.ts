
import { useState, useEffect, useCallback } from 'react';
import { useVolumeButtonDoubleTap } from './use-double-tap';
import { toast } from './use-toast';

export function useEmergencyFeatures() {
  const [sirenActive, setSirenActive] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'off' | 'video' | 'audio' | 'photo'>('off');
  const [neighborAlertSent, setNeighborAlertSent] = useState(false);
  const [policeNotified, setPoliceNotified] = useState(false);
  
  // Create stable callback functions to prevent re-renders
  const handleToggleSiren = useCallback(() => {
    setSirenActive(prev => !prev);
  }, []);

  const handleChangeRecordingMode = useCallback((mode: 'off' | 'video' | 'audio' | 'photo') => {
    setRecordingMode(mode);
  }, []);

  const handleSendNeighborAlert = useCallback(() => {
    setNeighborAlertSent(true);
  }, []);

  const handleCallPolice = useCallback(() => {
    setPoliceNotified(true);
  }, []);
  
  // Activate siren on volume button double tap
  useVolumeButtonDoubleTap(() => {
    if (!sirenActive) {
      toast({
        title: "Police Siren Activated",
        description: "Emergency siren activated by double-tap of volume buttons."
      });
      setSirenActive(true);
    }
  });

  useEffect(() => {
    return () => {
      setSirenActive(false);
      setRecordingMode('off');
    };
  }, []);
  
  return {
    features: {
      sirenActive,
      recordingMode,
      neighborAlertSent,
      policeNotified
    },
    updateFeatures: {
      onToggleSiren: handleToggleSiren,
      onChangeRecordingMode: handleChangeRecordingMode,
      onSendNeighborAlert: handleSendNeighborAlert,
      onCallPolice: handleCallPolice
    }
  };
}
