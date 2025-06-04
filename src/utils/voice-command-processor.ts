
import { ProcessedCommand } from './voice/types';
import { processCommand } from './voice/commandProcessor';

// Main voice command processing function
export const processVoiceCommand = async (transcript: string): Promise<ProcessedCommand | null> => {
  return await processCommand(transcript);
};

// Generate appropriate response based on command
export const generateCommandResponse = async (command: ProcessedCommand): Promise<string> => {
  const { type, urgency, originalText } = command;
  
  switch (type) {
    case 'emergency':
      if (urgency === 'critical') {
        return "Critical emergency detected. Activating all emergency protocols immediately. Help is on the way.";
      } else if (urgency === 'high') {
        return "Emergency situation recognized. Initiating emergency response. Stay calm.";
      }
      return "Emergency command received. Taking appropriate action.";
      
    case 'help':
      return "I'm here to help with emergency situations. You can say commands like 'Soteria help', 'Soteria danger', or 'Soteria call police'.";
      
    case 'status':
      return "Security system is active and monitoring. All systems are operational.";
      
    case 'call':
      return "Initiating emergency call. Please stay on the line.";
      
    case 'alert':
      return "Sending emergency alerts to your contacts now.";
      
    case 'record':
      return "Starting emergency recording. Evidence is being captured.";
      
    case 'location':
      return "Sharing your current location with emergency contacts.";
      
    case 'unknown':
      return "I didn't understand that command. Try saying 'Soteria help' for assistance, or speak more clearly.";
      
    default:
      return "Command processed. Let me know if you need any help.";
  }
};

// Check if text contains emergency keywords
export const containsEmergencyKeywords = (text: string): boolean => {
  const emergencyKeywords = [
    'help', 'emergency', 'danger', 'threat', 'attack',
    'weapon', 'gun', 'knife', 'hurt', 'injured', 'pain',
    'scared', 'afraid', 'call police', 'call 911',
    'medical', 'ambulance', 'fire', 'break in'
  ];
  
  const lowerText = text.toLowerCase();
  return emergencyKeywords.some(keyword => lowerText.includes(keyword));
};

// Extract urgency level from text
export const extractUrgency = (text: string): 'low' | 'medium' | 'high' | 'critical' => {
  const criticalKeywords = ['gun', 'weapon', 'attack', 'breaking in', 'help me'];
  const highKeywords = ['emergency', 'danger', 'threat', 'scared', 'hurt'];
  const mediumKeywords = ['help', 'problem', 'issue'];
  
  const lowerText = text.toLowerCase();
  
  if (criticalKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'critical';
  } else if (highKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'high';
  } else if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
};
