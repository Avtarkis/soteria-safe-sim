
import { ProcessedCommand } from '../types';
import { determineCommandType, determineUrgency } from '../commandTypes';
import { extractParameters } from './parameterExtractor';
import { toast } from '@/hooks/use-toast';

export const processCommand = async (transcript: string): Promise<ProcessedCommand | null> => {
  if (!transcript?.trim()) return null;
  
  const normalizedText = transcript.toLowerCase().trim();
  if (!normalizedText.includes('soteria')) return null;

  try {
    const commandType = determineCommandType(normalizedText);
    const params = extractParameters(normalizedText, commandType);
    const urgency = determineUrgency(normalizedText);
    
    return {
      type: commandType,
      confidence: 0.8,
      originalText: transcript,
      normalizedText,
      urgency,
      params
    };
  } catch (error) {
    console.error('Error processing command:', error);
    toast({
      title: "Command Processing Error",
      description: "Failed to process command. Please try again."
    });
    return null;
  }
};

// Export as CommandProcessor class for compatibility
export class CommandProcessor {
  static async processCommand(transcript: string): Promise<ProcessedCommand | null> {
    return processCommand(transcript);
  }
}
