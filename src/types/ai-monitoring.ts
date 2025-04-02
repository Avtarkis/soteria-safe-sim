
export type HealthReadingType = 'heartbeat' | 'temperature' | 'breathing' | 'movement' | 'gps' | 'environment';

export interface HealthReading {
  id: string;
  type: HealthReadingType;
  value: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface AIThreatDetection {
  id: string;
  type: 'health' | 'environment' | 'security';
  subtype: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendedAction: string;
  automaticResponseTaken: string | null;
  timestamp: string;
  rawData?: any;
}

export interface AIMonitoringSettings {
  enabled: boolean;
  healthMonitoring: boolean;
  environmentalMonitoring: boolean;
  securityMonitoring: boolean;
  autoResponseLevel: 'none' | 'notify' | 'assist' | 'full';
  emergencyContactsToNotify: string[];
}
