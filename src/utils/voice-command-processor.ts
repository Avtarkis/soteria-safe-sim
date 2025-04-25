
import { ProcessedCommand, VoiceCommandType } from './voice/types';
import { determineCommandType } from './voice/commandTypes';
import { generateResponse } from './voice/responseGenerator';

export const processVoiceCommand = async (transcript: string): Promise<ProcessedCommand | null> => {
  if (!transcript?.trim()) return null;
  
  const normalizedText = transcript.toLowerCase().trim();
  if (!normalizedText.includes('soteria')) return null;

  try {
    const type = determineCommandType(normalizedText);
    const urgency = determineUrgency(normalizedText);
    const params = extractParameters(normalizedText, type);
    
    return {
      type,
      confidence: 0.8,
      originalText: transcript,
      normalizedText,
      urgency,
      params
    };
  } catch (error) {
    console.error('Error processing command:', error);
    return null;
  }
};

export const determineUrgency = (text: string): 'low' | 'medium' | 'high' => {
  const urgentWords = ['emergency', 'help', 'danger', 'urgent', 'now'];
  const matches = urgentWords.filter(word => text.includes(word)).length;
  
  if (matches >= 2) return 'high';
  if (matches >= 1) return 'medium';
  return 'low';
};

export const extractParameters = (text: string, commandType: VoiceCommandType): Record<string, string> => {
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

export const generateCommandResponse = async (command: ProcessedCommand): Promise<string> => {
  return generateResponse(command);
};

export { ProcessedCommand };
