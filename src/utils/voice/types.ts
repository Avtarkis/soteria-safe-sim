
// Voice command types and interfaces
export type VoiceCommandType = 
  | 'emergency'
  | 'help' 
  | 'status'
  | 'call'
  | 'alert'
  | 'record'
  | 'location'
  | 'unknown';

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
