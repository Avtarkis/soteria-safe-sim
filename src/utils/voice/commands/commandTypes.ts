
import { VoiceCommandType } from '../types';

export const COMMAND_KEYWORDS = {
  emergency_call: ['call', 'emergency', 'police', 'ambulance', 'help', '911', 'services'],
  location_share: ['location', 'send', 'share', 'contacts', 'where', 'find'],
  start_recording: ['record', 'video', 'audio', 'evidence', 'capture', 'photo'],
  silent_alarm: ['silent', 'alarm', 'alert', 'quiet', 'discreet']
} as const;

export const determineCommandType = (text: string): VoiceCommandType => {
  const scores = Object.entries(COMMAND_KEYWORDS).map(([type, keywords]) => ({
    type,
    score: keywords.filter(keyword => text.includes(keyword)).length
  }));
  
  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].type as VoiceCommandType : 'conversation';
};
