
import { ProcessedCommand, VoiceCommandType } from './voice/types';
import { determineCommandType, determineUrgency } from './voice/commandTypes';
import { extractParameters } from './voice/commands/parameterExtractor';
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

export const generateCommandResponse = async (command: ProcessedCommand): Promise<string> => {
  return generateResponse(command);
};

// Use 'export type' instead of 'export' for type re-exports
export type { ProcessedCommand };
