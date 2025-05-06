
import React, { useState } from 'react';
import MapHeaderTitle from './header/MapHeaderTitle';
import ReportThreatButton from './header/ReportThreatButton';
import DirectionsButton from './header/DirectionsButton';
import { EmergencyButtonGroup } from './header/EmergencyButtonGroup';
import { useSafetyAIMonitoring } from '@/services/SafetyAIMonitoringService';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ThreatsMapHeaderProps {
  destination: {
    name: string;
    coordinates: [number, number];
  };
}

const ThreatsMapHeader = ({ destination }: ThreatsMapHeaderProps) => {
  const { status, startMonitoring, stopMonitoring } = useSafetyAIMonitoring();
  const [isThreatDetectionActive, setIsThreatDetectionActive] = useState(false);
  
  const toggleThreatDetection = async () => {
    if (isThreatDetectionActive) {
      stopMonitoring();
      setIsThreatDetectionActive(false);
      
      toast({
        title: "Threat Detection Deactivated",
        description: "AI safety monitoring has been turned off.",
      });
    } else {
      const success = await startMonitoring({
        poseDetection: true,
        audioDetection: true,
        healthMonitoring: true
      });
      
      if (success) {
        setIsThreatDetectionActive(true);
        
        toast({
          title: "Threat Detection Activated",
          description: "AI is now monitoring for threats, health issues, and emergencies.",
        });
      } else {
        toast({
          title: "Activation Failed",
          description: "Could not activate threat detection. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 pb-4 md:pb-6">
      <div className="flex justify-between items-center">
        <MapHeaderTitle destination={destination} />
        
        <div className="flex items-center gap-2">
          <Button
            variant={isThreatDetectionActive ? "default" : "outline"}
            size="sm"
            onClick={toggleThreatDetection}
            className="gap-1.5"
          >
            {isThreatDetectionActive ? (
              <>
                <ShieldCheck className="h-4 w-4 text-green-100" />
                <span className="hidden md:inline">AI Protection Active</span>
                <span className="inline md:hidden">AI On</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-4 w-4" />
                <span className="hidden md:inline">Activate AI Protection</span>
                <span className="inline md:hidden">AI Off</span>
              </>
            )}
          </Button>
          
          <EmergencyButtonGroup />
          <ReportThreatButton destination={destination} />
          <DirectionsButton destination={destination} />
        </div>
      </div>
    </div>
  );
};

export default ThreatsMapHeader;
