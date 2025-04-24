
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

// New types for Web Audio API recorder
export interface AudioRecorderState {
  isRecording: boolean;
  audioUrl: string | null;
  error: string | null;
}

export interface RecordedAudioData {
  blob: Blob;
  duration: number;
  url: string;
}
