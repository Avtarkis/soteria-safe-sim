
// Import types from emergency.d.ts instead of .ts
import type { EmergencyContact } from '@/types/emergency.d';

export interface EmergencyEvent {
  type: 'weapon' | 'fall' | 'audio' | 'health' | 'manual';
  subtype?: string;
  confidence: number;
  timestamp: number;
  location?: [number, number];
  details?: string;
  source: 'pose' | 'audio' | 'sensor' | 'voice' | 'manual';
}

export interface EmergencyAction {
  type: 'sms' | 'call' | 'record' | 'notify' | 'siren' | 'broadcast';
  target?: string;
  data?: any;
}

export interface EmergencySettings {
  autoNotifyContacts: boolean;
  autoCallEmergencyServices: boolean;
  autoRecord: boolean;
  confidenceThreshold: number;
  emergencyContacts: EmergencyContact[];
}
