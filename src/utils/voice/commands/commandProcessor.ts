
import { ProcessedCommand, VoiceCommandType } from '../types';
import { determineUrgency } from '../commandTypes';
import { extractParameters } from './parameterExtractor';
import { deepgramService } from '@/services/deepgramService';
import { determineCommandType } from '../commandTypes';
import EmergencyResponseSystem from '@/utils/emergency/EmergencyResponseSystem';
import secureDefenseSystem from '@/services/SecureDefenseSystem';

export class CommandProcessor {
  public static async processCommand(text: string): Promise<ProcessedCommand | null> {
    if (!text?.trim()) return null;
    
    const normalizedText = text.toLowerCase().trim();
    if (!normalizedText.includes('soteria')) return null;

    try {
      const type = await this.determineType(normalizedText);
      const urgency = determineUrgency(normalizedText);
      const params = extractParameters(normalizedText, type);
      
      // Check for emergency keywords that should trigger the emergency response
      const emergencyKeywords = [
        'help', 'police', 'danger', 'emergency', 'threat', 'attack', 
        'weapon', 'gun', 'knife', 'hurt', 'kill', 'die'
      ];
      
      const containsEmergencyKeyword = emergencyKeywords.some(keyword => 
        normalizedText.includes(keyword)
      );
      
      // If emergency keywords are detected, trigger emergency response systems
      if (containsEmergencyKeyword) {
        console.log("Emergency keywords detected in voice command:", text);
        
        // First trigger the existing emergency response system
        EmergencyResponseSystem.handleVoiceTrigger(normalizedText, 0.95);
        
        // Then also trigger our new secure defense system
        await secureDefenseSystem.processVoiceCommand(normalizedText, 0.95);
      }
      
      return {
        type,
        confidence: 0.8,
        originalText: text,
        normalizedText,
        urgency,
        params
      };
    } catch (error) {
      console.error('Error processing command:', error);
      return null;
    }
  }

  private static async determineType(text: string): Promise<VoiceCommandType> {
    try {
      const sentiment = await deepgramService.analyzeSentiment(text);
      if (sentiment && sentiment.confidence > 0.8) {
        // Assuming the deepgramService now returns a type field instead of commandType
        if ('type' in sentiment) {
          return sentiment.type as VoiceCommandType;
        }
      }
    } catch (error) {
      console.warn('Deepgram service unavailable, falling back to local processing');
    }
    
    return determineCommandType(text);
  }
}
