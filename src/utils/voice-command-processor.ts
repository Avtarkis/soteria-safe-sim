
import { ProcessedCommand, VoiceCommandType } from './voice/types';
import { determineCommandType, determineUrgency } from './voice/commandTypes';
import { extractParameters } from './voice/commands/parameterExtractor';
import { generateResponse } from './voice/responseGenerator';
import { openaiService } from '../services/openaiService';

export const processVoiceCommand = async (transcript: string): Promise<ProcessedCommand | null> => {
  if (!transcript?.trim()) return null;
  
  const normalizedText = transcript.toLowerCase().trim();
  if (!normalizedText.includes('soteria')) return null;

  try {
    // Determine if this is a command or a conversational query
    const type = determineCommandType(normalizedText);
    const urgency = determineUrgency(normalizedText);
    const params = extractParameters(normalizedText, type);
    
    // Create the processed command
    return {
      type,
      confidence: type === 'conversation' ? 0.6 : 0.8, // Lower confidence for conversation type
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
  // For conversational queries, use OpenAI instead of predefined responses
  if (command.type === 'conversation') {
    try {
      const response = await openaiService.generateResponse([
        { 
          role: 'system', 
          content: 'You are Soteria, an AI safety assistant in a personal safety app. You help users with safety concerns, family monitoring, emergency situations, travel advice, and personal security. Your responses should be helpful, concise, and empathetic. Focus only on topics related to personal safety, security, and the app\'s features. If asked about something unrelated, gently redirect to how you can help with safety concerns.'
        },
        {
          role: 'user',
          content: command.originalText
        }
      ]);
      
      return response || "I'm sorry, I couldn't generate a response right now.";
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      return "I'm having trouble understanding that right now. Is there something specific about your safety I can help you with?";
    }
  }
  
  // Use predefined responses for recognized commands
  return generateResponse(command);
};

// Use 'export type' instead of 'export' for type re-exports
export type { ProcessedCommand };
