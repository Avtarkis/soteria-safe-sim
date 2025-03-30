
import React from 'react';
import EmergencySiren from './EmergencySiren';
import EmergencyRecorder from './EmergencyRecorder';
import EmergencyBroadcaster from './EmergencyBroadcaster';
import PoliceNotifier from './PoliceNotifier';
import { EmergencyFeatures as EmergencyFeaturesType } from '@/types/threats';

interface EmergencyFeaturesProps {
  features: {
    sirenActive: boolean;
    recordingMode: 'off' | 'video' | 'audio' | 'photo';
    neighborAlertSent: boolean;
    policeNotified: boolean;
  };
  onUpdateFeatures: {
    onToggleSiren: () => void;
    onChangeRecordingMode: (mode: 'off' | 'video' | 'audio' | 'photo') => void;
    onSendNeighborAlert: () => void;
    onCallPolice: () => void;
  };
}

const EmergencyFeatures: React.FC<EmergencyFeaturesProps> = ({ 
  features, 
  onUpdateFeatures 
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Emergency Features</h2>
        <div className="text-xs text-muted-foreground bg-secondary/60 px-3 py-1 rounded-full">
          Double-tap volume buttons to activate siren
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmergencySiren 
          isActive={features.sirenActive} 
          onToggle={onUpdateFeatures.onToggleSiren} 
        />
        <EmergencyRecorder 
          mode={features.recordingMode} 
          onModeChange={onUpdateFeatures.onChangeRecordingMode} 
        />
        <EmergencyBroadcaster 
          hasBeenSent={features.neighborAlertSent} 
          onSendAlert={onUpdateFeatures.onSendNeighborAlert} 
        />
        <PoliceNotifier 
          hasBeenCalled={features.policeNotified} 
          onCallPolice={onUpdateFeatures.onCallPolice} 
        />
      </div>
    </div>
  );
};

export default EmergencyFeatures;
