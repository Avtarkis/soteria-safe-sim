
export type VoiceCommandType = 
  | 'emergency_call'
  | 'location_share'
  | 'start_recording'
  | 'silent_alarm'
  | 'travel_advice'
  | 'cybersecurity_info'
  | 'family_location'
  | 'safe_route'
  | 'conversation'
  | 'unknown';

export interface ProcessedCommand {
  type: VoiceCommandType;
  confidence: number;
  originalText: string;
  normalizedText: string;
  urgency: 'low' | 'medium' | 'high';
  params?: Record<string, string>;
}

export interface CommandResponse {
  text: string;
  action?: () => void;
}
