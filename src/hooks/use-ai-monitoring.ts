
import { useState, useEffect } from 'react';
import { aiMonitoringService } from '@/services/aiMonitoringService';
import { AIThreatDetection, AIMonitoringSettings } from '@/types/ai-monitoring';
import { useToast } from '@/hooks/use-toast';

export function useAIMonitoring() {
  const [detections, setDetections] = useState<AIThreatDetection[]>([]);
  const [settings, setSettings] = useState<AIMonitoringSettings>(aiMonitoringService.getSettings());
  const [isMonitoring, setIsMonitoring] = useState<boolean>(settings.enabled);
  const { toast } = useToast();

  // Initialize monitoring
  useEffect(() => {
    if (settings.enabled) {
      aiMonitoringService.startMonitoring();
      setIsMonitoring(true);
    } else {
      aiMonitoringService.stopMonitoring();
      setIsMonitoring(false);
    }
  }, [settings.enabled]);

  // Listen for new threat detections
  useEffect(() => {
    const removeListener = aiMonitoringService.addEventListener((detection) => {
      // Add the new detection to our state
      setDetections(prev => [detection, ...prev].slice(0, 50)); // Keep the last 50 detections

      // Show a toast for critical/high severity detections
      if (detection.severity === 'critical' || detection.severity === 'high') {
        toast({
          title: `${detection.severity === 'critical' ? '⚠️ CRITICAL' : '⚠️ HIGH'} ${detection.type.toUpperCase()} ALERT`,
          description: detection.description,
          variant: "destructive",
          duration: 10000, // Show longer for critical alerts
        });
      } else if (detection.severity === 'medium') {
        toast({
          title: `${detection.type.toUpperCase()} Warning`,
          description: detection.description,
          variant: "default",
          duration: 5000,
        });
      }
    });

    return () => {
      removeListener();
    };
  }, [toast]);

  // Update settings
  const updateSettings = (newSettings: Partial<AIMonitoringSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    aiMonitoringService.saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  // Toggle monitoring
  const toggleMonitoring = () => {
    const newEnabledState = !settings.enabled;
    updateSettings({ enabled: newEnabledState });
  };

  return {
    detections,
    settings,
    isMonitoring,
    updateSettings,
    toggleMonitoring,
  };
}

export default useAIMonitoring;
