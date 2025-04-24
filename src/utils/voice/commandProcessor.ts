
import { ProcessedCommand, VoiceCommandType } from './types';
import { toast } from '@/hooks/use-toast';

const COMMAND_KEYWORDS = {
  emergency_call: ['call', 'emergency', 'police', 'ambulance', 'help', '911', 'services'],
  location_share: ['location', 'send', 'share', 'contacts', 'where', 'find'],
  start_recording: ['record', 'video', 'audio', 'evidence', 'capture', 'photo'],
  silent_alarm: ['silent', 'alarm', 'alert', 'quiet', 'discreet']
};

export const processCommand = async (transcript: string): Promise<ProcessedCommand | null> => {
  if (!transcript?.trim()) return null;
  
  const normalizedText = transcript.toLowerCase().trim();
  if (!normalizedText.includes('soteria')) return null;

  const commandType = determineCommandType(normalizedText);
  const params = extractParameters(normalizedText, commandType);
  const confidence = calculateConfidence(normalizedText, commandType);
  
  return {
    type: commandType,
    confidence,
    originalText: transcript,
    normalizedText,
    urgency: determineUrgency(normalizedText),
    params
  };
};

const determineCommandType = (text: string): VoiceCommandType => {
  const scores = Object.entries(COMMAND_KEYWORDS).map(([type, keywords]) => ({
    type,
    score: keywords.filter(keyword => text.includes(keyword)).length
  }));
  
  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].type as VoiceCommandType : 'conversation';
};

const extractParameters = (text: string, commandType: VoiceCommandType): Record<string, string> => {
  const params: Record<string, string> = {};
  
  switch (commandType) {
    case 'emergency_call':
      const serviceMatch = text.match(/call\s+(\w+)/);
      if (serviceMatch) params.service = serviceMatch[1];
      break;
      
    case 'location_share':
      const contactMatch = text.match(/share\s+(?:with|to)\s+(\w+)/);
      if (contactMatch) params.contact = contactMatch[1];
      break;
  }
  
  return params;
};

const calculateConfidence = (text: string, commandType: VoiceCommandType): number => {
  const keywords = COMMAND_KEYWORDS[commandType as keyof typeof COMMAND_KEYWORDS] || [];
  const matches = keywords.filter(keyword => text.includes(keyword)).length;
  return Math.min(matches / 2, 1);
};

const determineUrgency = (text: string): 'low' | 'medium' | 'high' => {
  const urgentWords = ['emergency', 'help', 'danger', 'urgent', 'now'];
  const matches = urgentWords.filter(word => text.includes(word)).length;
  
  if (matches >= 2) return 'high';
  if (matches >= 1) return 'medium';
  return 'low';
};
