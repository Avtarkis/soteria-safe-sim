
import { ProcessedCommand, VoiceCommandType } from './types';
import { connectivityService } from './connectivity';
import { responseCache } from './responseCache';
import { deepgramService } from '@/services/deepgramService';

const SIMPLE_COMMANDS = new Set<VoiceCommandType>([
  'emergency_call',
  'silent_alarm',
  'start_recording'
]);

export class HybridCommandProcessor {
  private static confidenceThreshold = 0.7;

  public static isSimpleCommand(command: VoiceCommandType): boolean {
    return SIMPLE_COMMANDS.has(command);
  }

  public static shouldUseFallback(command: ProcessedCommand): boolean {
    // Use fallback if:
    // 1. We're offline or have poor connection
    // 2. Command confidence is below threshold
    // 3. It's a simple command that doesn't need API processing
    const networkStatus = connectivityService.getCurrentStatus();
    return networkStatus !== 'online' || 
           command.confidence < this.confidenceThreshold ||
           this.isSimpleCommand(command.type);
  }

  public static async processCommand(
    text: string,
    audioBlob?: Blob
  ): Promise<ProcessedCommand> {
    // Check cache first
    const cachedResponse = responseCache.get(text);
    if (cachedResponse) {
      // Parse the cached response string back to a ProcessedCommand object
      return JSON.parse(cachedResponse) as ProcessedCommand;
    }

    try {
      // Attempt to use advanced processing if available
      if (connectivityService.getCurrentStatus() === 'online' && audioBlob) {
        const result = await deepgramService.transcribeAudio(audioBlob);
        // Cache the result
        responseCache.set(text, JSON.stringify(result), result.confidence);
        return result;
      }
    } catch (error) {
      console.error('Advanced processing failed, falling back to local:', error);
    }

    // Fallback to local processing
    return this.processLocally(text);
  }

  private static processLocally(text: string): ProcessedCommand {
    // Use the existing local command processing logic
    // This is a simplified version - you can expand it based on your needs
    const normalizedText = text.toLowerCase();
    const type = this.determineCommandType(normalizedText);
    
    return {
      type,
      confidence: 0.8, // Default confidence for local processing
      originalText: text,
      normalizedText,
      urgency: 'medium'
    };
  }

  private static determineCommandType(text: string): VoiceCommandType {
    if (text.includes('emergency') || text.includes('help')) return 'emergency_call';
    if (text.includes('record')) return 'start_recording';
    if (text.includes('silent') || text.includes('alarm')) return 'silent_alarm';
    if (text.includes('location')) return 'location_share';
    return 'conversation';
  }
}
