
import { toast } from '@/hooks/use-toast';
import { deepgramService } from '@/services/deepgramService';

// Command types for the voice assistant
export type VoiceCommandType = 
  | 'emergency_call'
  | 'location_share'
  | 'start_recording'
  | 'silent_alarm'
  | 'unknown';

export interface ProcessedCommand {
  type: VoiceCommandType;
  confidence: number;
  originalText: string;
  normalizedText: string;
  urgency: 'low' | 'medium' | 'high';
}

// Keywords for each command type
const COMMAND_KEYWORDS = {
  emergency_call: ['call', 'emergency', 'police', 'ambulance', 'help', '911', 'services'],
  location_share: ['location', 'send', 'share', 'contacts', 'where', 'find'],
  start_recording: ['record', 'video', 'audio', 'evidence', 'capture', 'photo'],
  silent_alarm: ['silent', 'alarm', 'alert', 'quiet', 'discreet']
};

// Process raw transcript to extract commands
export async function processVoiceCommand(transcript: string): Promise<ProcessedCommand | null> {
  if (!transcript || transcript.trim() === '') return null;
  
  // Check if the wake word "Soteria" is present
  const normalizedText = transcript.toLowerCase().trim();
  if (!normalizedText.includes('soteria')) {
    return null;
  }
  
  try {
    // Analyze sentiment using Deepgram's sentiment analysis
    const sentimentAnalysis = await deepgramService.analyzeSentiment(normalizedText);
    
    // Determine command type based on keywords
    const commandType = determineCommandType(normalizedText);
    
    // Calculate confidence based on keyword matches and sentiment
    const keywordMatchCount = countKeywordMatches(normalizedText, COMMAND_KEYWORDS[commandType] || []);
    const confidence = calculateConfidence(keywordMatchCount, sentimentAnalysis.confidence);
    
    return {
      type: commandType,
      confidence,
      originalText: transcript,
      normalizedText,
      urgency: sentimentAnalysis.urgency
    };
  } catch (error) {
    console.error('Error processing voice command:', error);
    toast({
      title: "Command Processing Error",
      description: "Failed to process voice command. Please try again."
    });
    return null;
  }
}

// Function to determine the command type
function determineCommandType(text: string): VoiceCommandType {
  // Check each command type for keyword matches
  const commandScores = Object.entries(COMMAND_KEYWORDS).map(([type, keywords]) => {
    const score = keywords.reduce((acc, keyword) => {
      return text.includes(keyword) ? acc + 1 : acc;
    }, 0);
    return { type, score };
  });
  
  // Sort by score (highest first) and get the best match
  commandScores.sort((a, b) => b.score - a.score);
  
  // If best match has a score of at least 1, return that command type
  if (commandScores[0].score >= 1) {
    return commandScores[0].type as VoiceCommandType;
  }
  
  return 'unknown';
}

// Count how many keywords from a list appear in the text
function countKeywordMatches(text: string, keywords: string[]): number {
  return keywords.filter(keyword => text.includes(keyword)).length;
}

// Calculate confidence score based on keyword matches and sentiment
function calculateConfidence(keywordMatches: number, sentimentConfidence: number): number {
  // Basic algorithm: more keyword matches = higher confidence
  // Normalize to range 0-1
  const keywordScore = Math.min(keywordMatches / 3, 1);
  
  // Combine with sentiment confidence
  return (keywordScore * 0.7) + (sentimentConfidence * 0.3);
}

// Generate response for the detected command
export async function generateCommandResponse(command: ProcessedCommand): Promise<string> {
  // In a real implementation, this would use GPT-3.5 Turbo
  // For now, we'll use predefined responses
  
  switch (command.type) {
    case 'emergency_call':
      return `I'll call emergency services for you right away. Stay calm and I'll connect you with help.`;
      
    case 'location_share':
      return `I'm sending your current location to your emergency contacts now. They'll be notified immediately.`;
      
    case 'start_recording':
      return `Starting to record evidence now. This will be saved securely and shared with your emergency contacts if needed.`;
      
    case 'silent_alarm':
      return `Silent alarm activated. Emergency services will be notified without making any sound.`;
      
    case 'unknown':
    default:
      return `I'm sorry, I didn't understand that command. Please try again or tap the emergency button for immediate help.`;
  }
}
