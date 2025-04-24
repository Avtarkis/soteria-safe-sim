
import { toast } from '@/hooks/use-toast';
import { deepgramService } from '@/services/deepgramService';

// Command types for the voice assistant
export type VoiceCommandType = 
  | 'emergency_call'
  | 'location_share'
  | 'start_recording'
  | 'silent_alarm'
  | 'travel_advice'
  | 'cybersecurity_info'
  | 'family_location'
  | 'safe_route'
  | 'conversation'
  | 'unknown';

export interface ProcessedCommand {
  type: VoiceCommandType;
  confidence: number;
  originalText: string;
  normalizedText: string;
  urgency: 'low' | 'medium' | 'high';
  params?: Record<string, string>;
}

// Keywords for each command type
const COMMAND_KEYWORDS = {
  emergency_call: ['call', 'emergency', 'police', 'ambulance', 'help', '911', 'services'],
  location_share: ['location', 'send', 'share', 'contacts', 'where', 'find'],
  start_recording: ['record', 'video', 'audio', 'evidence', 'capture', 'photo'],
  silent_alarm: ['silent', 'alarm', 'alert', 'quiet', 'discreet'],
  travel_advice: ['travel', 'trip', 'journey', 'vacation', 'destination', 'visit', 'advice', 'tips'],
  cybersecurity_info: ['cyber', 'security', 'hack', 'password', 'protect', 'data', 'privacy', 'breach'],
  family_location: ['family', 'member', 'mom', 'dad', 'sister', 'brother', 'locate', 'where'],
  safe_route: ['route', 'path', 'direction', 'way', 'escape', 'safe', 'quickest', 'fastest', 'safest']
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
    
    // Extract parameters from the command (for routes, locations, etc.)
    const params = extractParameters(normalizedText, commandType);
    
    // Calculate confidence based on keyword matches and sentiment
    const keywordMatchCount = countKeywordMatches(normalizedText, COMMAND_KEYWORDS[commandType] || []);
    const confidence = calculateConfidence(keywordMatchCount, sentimentAnalysis.confidence);
    
    // If no specific command is detected but wake word is present, treat it as a conversation
    if (commandType === 'unknown' && normalizedText.includes('soteria')) {
      return {
        type: 'conversation',
        confidence: 0.8,
        originalText: transcript,
        normalizedText,
        urgency: sentimentAnalysis.urgency,
        params
      };
    }
    
    return {
      type: commandType,
      confidence,
      originalText: transcript,
      normalizedText,
      urgency: sentimentAnalysis.urgency,
      params
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

// Extract parameters from the command text based on command type
function extractParameters(text: string, commandType: VoiceCommandType): Record<string, string> {
  const params: Record<string, string> = {};
  
  switch (commandType) {
    case 'safe_route':
      // Try to extract destination
      const toMatch = text.match(/(?:to|towards|for|destination) ([a-zA-Z0-9\s]+)/);
      if (toMatch && toMatch[1]) {
        params.destination = toMatch[1].trim();
      }
      break;
      
    case 'family_location':
      // Try to extract family member
      const memberMatch = text.match(/(?:where is|locate|find) (?:my|the) ([a-zA-Z]+)/);
      if (memberMatch && memberMatch[1]) {
        params.familyMember = memberMatch[1].trim();
      }
      break;
      
    case 'travel_advice':
      // Try to extract location
      const locationMatch = text.match(/(?:travel|trip|visit|go) (?:to|in) ([a-zA-Z\s]+)/);
      if (locationMatch && locationMatch[1]) {
        params.location = locationMatch[1].trim();
      }
      break;
  }
  
  return params;
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
  // In a real implementation, this would use GPT-3.5 Turbo or similar
  // For now, we'll use predefined responses with some context awareness
  
  switch (command.type) {
    case 'emergency_call':
      return `I'll call emergency services for you right away. Stay calm and I'll connect you with help.`;
      
    case 'location_share':
      return `I'm sending your current location to your emergency contacts now. They'll be notified immediately.`;
      
    case 'start_recording':
      return `Starting to record evidence now. This will be saved securely and shared with your emergency contacts if needed.`;
      
    case 'silent_alarm':
      return `Silent alarm activated. Emergency services will be notified without making any sound.`;
      
    case 'travel_advice':
      if (command.params?.location) {
        return `Here's some travel safety advice for ${command.params.location}: Always research local emergency numbers, share your itinerary with someone you trust, and keep copies of important documents. Would you like more specific advice?`;
      }
      return `I can provide travel safety advice for any destination. Just tell me where you're planning to go.`;
      
    case 'cybersecurity_info':
      return `To protect your digital security: use strong unique passwords, enable two-factor authentication, keep your devices updated, and be cautious about sharing personal information online. Would you like more specific cybersecurity tips?`;
      
    case 'family_location':
      if (command.params?.familyMember) {
        return `I'll check the location of your ${command.params.familyMember} for you. For this to work, they need to have shared their location with you through the Soteria family safety feature.`;
      }
      return `I can help you locate family members who have shared their location with you through Soteria. Which family member are you looking for?`;
      
    case 'safe_route':
      if (command.params?.destination) {
        return `I'm calculating the safest route to ${command.params.destination} now. This route will avoid high-risk areas and keep you on well-lit, populated streets. Would you like me to start navigation?`;
      }
      return `I can help you find the safest route to your destination. Where would you like to go?`;
      
    case 'conversation':
      return `I'm Soteria, your personal safety assistant. I can help with emergency services, location sharing, travel safety advice, cybersecurity tips, family monitoring, and finding safe routes. How can I help you today?`;
      
    case 'unknown':
    default:
      return `I'm sorry, I didn't understand that command. You can ask me about emergency help, location sharing, travel safety, cybersecurity, family monitoring, or safe routes. How can I assist you?`;
  }
}
