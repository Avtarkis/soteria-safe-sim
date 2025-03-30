
import { useState, useEffect } from 'react';
import { useVolumeButtonDoubleTap } from './use-double-tap';
import { toast } from './use-toast';
import { EmergencyFeatures } from '@/types/threats';

export function useEmergencyFeatures() {
  const [sirenActive, setSirenActive] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'off' | 'video' | 'audio' | 'photo'>('off');
  const [neighborAlertSent, setNeighborAlertSent] = useState(false);
  const [policeNotified, setPoliceNotified] = useState(false);
  
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
      onToggleSiren: () => setSirenActive(!sirenActive),
      onChangeRecordingMode: setRecordingMode,
      onSendNeighborAlert: () => setNeighborAlertSent(true),
      onCallPolice: () => setPoliceNotified(true)
    }
  };
}
