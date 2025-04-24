
import { ProcessedCommand, VoiceCommandType } from './types';

/**
 * Handles local voice command processing as a fallback
 * when advanced services are unavailable
 */
export class FallbackProcessor {
  /**
   * Processes text input and determines command type based on keywords
   */
  public static processText(text: string): ProcessedCommand {
    const normalizedText = text.toLowerCase();
    const type = this.determineCommandType(normalizedText);
    
    return {
      type,
      confidence: 0.8, // Default confidence for local processing
      originalText: text,
      normalizedText,
      urgency: this.determineUrgency(normalizedText, type)
    };
  }

  /**
   * Determines command type based on text keywords
   */
  private static determineCommandType(text: string): VoiceCommandType {
    if (text.includes('emergency') || text.includes('help') || text.includes('sos')) return 'emergency_call';
    if (text.includes('record')) return 'start_recording';
    if (text.includes('silent') || text.includes('alarm')) return 'silent_alarm';
    if (text.includes('location')) return 'location_share';
    if (text.includes('travel') || text.includes('route')) return 'travel_advice';
    if (text.includes('security') || text.includes('cyber')) return 'cybersecurity_info';
    if (text.includes('family')) return 'family_location';
    if (text.includes('safe') && text.includes('route')) return 'safe_route';
    return 'conversation';
  }

  /**
   * Determines urgency level based on command type and keywords
   */
  private static determineUrgency(text: string, commandType: VoiceCommandType): 'low' | 'medium' | 'high' {
    // Emergency commands are high urgency
    if (commandType === 'emergency_call' || commandType === 'silent_alarm') {
      return 'high';
    }

    // Check for urgency keywords
    if (text.includes('urgent') || text.includes('emergency') || text.includes('now') || text.includes('immediately')) {
      return 'high';
    }

    // Medium urgency for active requests
    if (commandType === 'location_share' || commandType === 'start_recording') {
      return 'medium';
    }

    // Default urgency is low
    return 'low';
  }
}
