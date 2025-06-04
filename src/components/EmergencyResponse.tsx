
import React from 'react';
import { useEmergencyFeatures } from '@/hooks/use-emergency-features';
import EmergencySOSButton from './emergency/EmergencySOSButton';
import VoiceAssistant from './emergency/VoiceAssistant';
import EmergencyFeatures from './emergency/EmergencyFeatures';
import EmergencyContacts from './emergency/EmergencyContacts';
import SafetyPlan from './emergency/SafetyPlan';
import AIMonitoringStatus from './ai/AIMonitoringStatus';
import AIDetections from './ai/AIDetections';
import EmergencyCallTesting from './emergency/EmergencyCallTesting';
import SecuritySystemControls from './security/SecuritySystemControls';
import { SecureDefenseProvider } from '@/services/SecureDefenseSystem';

// Define emergency contacts
const EmergencyContactsList = [
  { name: 'John Smith', relationship: 'Brother', phone: '+1 (555) 123-4567' },
  { name: 'Sarah Johnson', relationship: 'Friend', phone: '+1 (555) 987-6543' },
  { name: 'Emergency Services', relationship: 'Public Service', phone: '911' },
];

const EmergencyResponse: React.FC = () => {
  const { features, updateFeatures } = useEmergencyFeatures();

  return (
    <SecureDefenseProvider>
      <div className="container pb-10 animate-fade-in">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Emergency Response</h1>
          <p className="text-muted-foreground">
            Quick access to emergency features and contacts when you need help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <EmergencySOSButton />
          </div>
          
          <div>
            <VoiceAssistant />
          </div>
        </div>

        <div className="mb-8">
          <SecuritySystemControls />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <AIMonitoringStatus />
          <AIDetections />
        </div>

        <div className="mb-8">
          <EmergencyCallTesting />
        </div>

        <EmergencyFeatures 
          features={features}
          onUpdateFeatures={updateFeatures}
        />

        <EmergencyContacts contacts={EmergencyContactsList} />

        <SafetyPlan />
      </div>
    </SecureDefenseProvider>
  );
};

export default EmergencyResponse;
