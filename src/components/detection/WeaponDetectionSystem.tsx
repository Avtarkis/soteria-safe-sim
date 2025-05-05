
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/CardWrapper';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Mic, Radio, Activity, Settings, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SensorStatusIndicator from './SensorStatusIndicator';
import DetectionSettings from './DetectionSettings';
import { useWeaponDetection } from '@/hooks/detection/useWeaponDetection';
import { DetectionMode } from '@/types/detection';

const WeaponDetectionSystem = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Get detection state and functions from our custom hook
  const {
    isActive,
    detectionMode,
    sensitivityLevel,
    sensors,
    detectionStatus,
    lastAlert,
    toggleDetection,
    setDetectionMode,
    setSensitivityLevel,
    triggerTestAlert,
  } = useWeaponDetection();

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);

  // Handle activation toggle
  const handleToggleDetection = () => {
    if (!isActive) {
      toast({
        title: "Weapon Detection Activated",
        description: "The system is now monitoring for potential threats in your vicinity.",
      });
    }
    toggleDetection();
  };

  // Handle test alert
  const handleTestAlert = () => {
    triggerTestAlert();
  };

  return (
    <Card className="border-2 border-amber-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`h-6 w-6 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            <CardTitle>Weapons Detection System</CardTitle>
          </div>
          <Switch 
            checked={isActive}
            onCheckedChange={handleToggleDetection}
            aria-label="Toggle weapon detection"
          />
        </div>
        <CardDescription>
          AI-powered threat detection using device sensors
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Status indicator */}
          <div className={`p-3 rounded-md ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                <span className="font-medium">
                  {isActive 
                    ? `Active - ${detectionStatus.message}` 
                    : 'Inactive - Enable to start detection'}
                </span>
              </div>
              {detectionStatus.level > 0 && (
                <span className={`text-sm px-2 py-1 rounded 
                  ${detectionStatus.level === 1 ? 'bg-yellow-500/20 text-yellow-600' : 
                    detectionStatus.level === 2 ? 'bg-orange-500/20 text-orange-600' : 
                    'bg-red-500/20 text-red-600'}`}>
                  {detectionStatus.level === 1 ? 'Low Alert' : 
                   detectionStatus.level === 2 ? 'Medium Alert' : 'High Alert'}
                </span>
              )}
            </div>
          </div>

          {/* Sensor status indicators */}
          <div className="grid grid-cols-2 gap-3">
            <SensorStatusIndicator 
              icon={<Activity className="h-4 w-4" />}
              name="Motion"
              active={isActive && sensors.motion.active}
              status={sensors.motion.status}
            />
            <SensorStatusIndicator 
              icon={<Radio className="h-4 w-4" />}
              name="RF Signals"
              active={isActive && sensors.radioSignal.active}
              status={sensors.radioSignal.status}
            />
            <SensorStatusIndicator 
              icon={<Mic className="h-4 w-4" />}
              name="Audio"
              active={isActive && sensors.audio.active}
              status={sensors.audio.status}
            />
            <SensorStatusIndicator 
              icon={<PieChart className="h-4 w-4" />}
              name="AI Analysis"
              active={isActive && sensors.ai.active}
              status={sensors.ai.status}
            />
          </div>

          {/* Last alert info - Only show if there was an alert */}
          {lastAlert && (
            <div className="border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800/30 p-3 rounded-md">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-600">{lastAlert.title}</p>
                  <p className="text-sm text-red-600/80">{lastAlert.description}</p>
                  <p className="text-xs text-red-600/70 mt-1">
                    {new Date(lastAlert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleTestAlert}
              disabled={!isActive}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Test Alert
            </Button>
          </div>
        </div>

        {/* Settings modal */}
        <DetectionSettings 
          open={showSettings}
          onOpenChange={setShowSettings}
          detectionMode={detectionMode}
          sensitivityLevel={sensitivityLevel}
          onDetectionModeChange={setDetectionMode}
          onSensitivityChange={setSensitivityLevel}
        />
      </CardContent>
    </Card>
  );
};

export default WeaponDetectionSystem;
