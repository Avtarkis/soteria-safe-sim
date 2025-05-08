
export type HealthReadingType = 'heartbeat' | 'temperature' | 'breathing' | 'movement' | 'gps' | 'environment';

export interface HealthReading {
  id: string;
  type: HealthReadingType;
  value: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface AIThreatDetection {
  id?: string;
  type?: 'health' | 'environment' | 'security';
  subtype?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
  description?: string; 
  recommendedAction?: string;
  automaticResponseTaken?: string | null;
  timestamp?: string | number;
  rawData?: any;
  details?: string;
  source?: string;
}

export interface AIMonitoringSettings {
  enabled: boolean;
  healthMonitoring: boolean;
  environmentalMonitoring: boolean;
  securityMonitoring: boolean;
  autoResponseLevel: 'none' | 'notify' | 'assist' | 'full';
  emergencyContactsToNotify: string[];
}

// For Dashboard compatibility - now we can adapt the Dashboard to use AIThreatDetection directly
export interface Detection extends AIThreatDetection {
  description: string; // Required field for Detection type
}
