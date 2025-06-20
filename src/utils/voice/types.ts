
// Voice command types and interfaces
export type VoiceCommandType = 
  | 'emergency'
  | 'help' 
  | 'status'
  | 'call'
  | 'alert'
  | 'record'
  | 'location'
  | 'unknown'
  | 'emergency_call'
  | 'location_share'
  | 'start_recording'
  | 'silent_alarm'
  | 'travel_advice'
  | 'cybersecurity_info'
  | 'family_location'
  | 'safe_route'
  | 'conversation'
  | 'stop'
  | 'cancel'
  | 'weather_alert'
  | 'medical_advice'
  | 'personal_safety';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ProcessedCommand {
  type: VoiceCommandType;
  confidence: number;
  originalText: string;
  normalizedText: string;
  urgency: UrgencyLevel;
  params?: Record<string, any>;
}

export interface VoiceCommandParams {
  target?: string;
  location?: string;
  message?: string;
  duration?: number;
}
