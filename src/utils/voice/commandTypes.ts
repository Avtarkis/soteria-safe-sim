
import { VoiceCommandType } from './types';

export const COMMAND_KEYWORDS = {
  emergency_call: ['call', 'emergency', 'police', 'ambulance', 'help', '911', 'services'],
  location_share: ['location', 'send', 'share', 'contacts', 'where', 'find'],
  start_recording: ['record', 'video', 'audio', 'evidence', 'capture', 'photo'],
  silent_alarm: ['silent', 'alarm', 'alert', 'quiet', 'discreet'],
  travel_advice: ['travel', 'trip', 'journey', 'vacation', 'route', 'destination'],
  cybersecurity_info: ['cyber', 'security', 'password', 'hack', 'digital', 'online', 'privacy'],
  family_location: ['family', 'kids', 'child', 'parent', 'locate', 'tracking', 'grandma', 'grandpa', 'son', 'daughter', 'mom', 'dad'],
  safe_route: ['route', 'path', 'directions', 'navigate', 'safest', 'way'],
  help: ['help', 'assist', 'guide', 'support', 'information'],
  stop: ['stop', 'end', 'finish', 'terminate', 'halt'],
  cancel: ['cancel', 'abort', 'dismiss', 'nevermind'],
  weather_alert: ['weather', 'storm', 'forecast', 'rain', 'temperature'],
  medical_advice: ['medical', 'health', 'injury', 'sick', 'doctor', 'hospital', 'pain'],
  personal_safety: ['safety', 'protect', 'defense', 'secure', 'shield']
} as const;

export const determineCommandType = (text: string): VoiceCommandType => {
  // First check for specific command keywords
  const scores = Object.entries(COMMAND_KEYWORDS).map(([type, keywords]) => ({
    type,
    score: keywords.filter(keyword => text.includes(keyword)).length
  }));
  
  scores.sort((a, b) => b.score - a.score);
  
  // If we have a clear command match with multiple keyword matches, use it
  if (scores[0].score >= 2) {
    return scores[0].type as VoiceCommandType;
  }
  
  // If we have a weak match (just one keyword) or no match, 
  // treat it as a conversation query
  return 'conversation';
};

export const determineUrgency = (text: string): 'low' | 'medium' | 'high' => {
  const urgentWords = ['emergency', 'help', 'danger', 'urgent', 'now', 'immediately', 'critical', 'life', 'death', 'severe'];
  const matches = urgentWords.filter(word => text.includes(word)).length;
  
  if (matches >= 3) return 'high';
  if (matches >= 1) return 'medium';
  return 'low';
};
