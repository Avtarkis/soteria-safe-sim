
import { useState, useCallback, useEffect } from 'react';

export interface MonitoringStatus {
  active: boolean;
  detectionModes: {
    pose: boolean;
    audio: boolean;
    health: boolean;
  };
  lastEvents: {
    pose?: { timestamp: number; details: string };
    audio?: { timestamp: number; details: string };
    health?: { timestamp: number; details: string };
  };
}

export interface MonitoringOptions {
  poseDetection?: boolean;
  audioDetection?: boolean;
  healthMonitoring?: boolean;
}

class SafetyAIMonitoringService {
  private status: MonitoringStatus = {
    active: false,
    detectionModes: {
      pose: false,
      audio: false,
      health: false
    },
    lastEvents: {}
  };

  private listeners: ((status: MonitoringStatus) => void)[] = [];

  startMonitoring(options: MonitoringOptions): Promise<boolean> {
    this.status = {
      active: true,
      detectionModes: {
        pose: options.poseDetection ?? true,
        audio: options.audioDetection ?? true,
        health: options.healthMonitoring ?? true
      },
      lastEvents: {}
    };
    
    this.notifyListeners();
    return Promise.resolve(true);
  }

  stopMonitoring(): void {
    this.status = {
      active: false,
      detectionModes: {
        pose: false,
        audio: false,
        health: false
      },
      lastEvents: {}
    };
    
    this.notifyListeners();
  }

  getStatus(): MonitoringStatus {
    return { ...this.status };
  }

  subscribe(listener: (status: MonitoringStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getStatus()));
  }
}

const safetyAIService = new SafetyAIMonitoringService();

export const useSafetyAIMonitoring = () => {
  const [status, setStatus] = useState<MonitoringStatus>(safetyAIService.getStatus());

  useEffect(() => {
    const unsubscribe = safetyAIService.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const startMonitoring = useCallback((options: MonitoringOptions) => {
    return safetyAIService.startMonitoring(options);
  }, []);

  const stopMonitoring = useCallback(() => {
    safetyAIService.stopMonitoring();
  }, []);

  return {
    status,
    startMonitoring,
    stopMonitoring
  };
};

export default safetyAIService;
