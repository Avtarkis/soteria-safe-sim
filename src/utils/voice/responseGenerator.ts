
import { ProcessedCommand } from './types';
import { toast } from '@/hooks/use-toast';

export const generateResponse = async (command: ProcessedCommand): Promise<string> => {
  switch (command.type) {
    case 'emergency_call':
      toast({
        title: "Emergency Call",
        description: "Initiating emergency call to local services."
      });
      return `Calling emergency services right away. Stay calm, help is coming.`;
      
    case 'location_share':
      toast({
        title: "Location Shared",
        description: "Your location has been shared with emergency contacts."
      });
      return `I'm sharing your current location with your emergency contacts.`;
      
    case 'start_recording':
      toast({
        title: "Recording Started",
        description: "Evidence recording has been initiated."
      });
      return `Starting to record evidence now. This will be saved securely.`;
      
    case 'silent_alarm':
      toast({
        title: "Silent Alarm",
        description: "Silent alarm activated. Help is on the way."
      });
      return `Silent alarm activated. Emergency services have been notified silently.`;
    
    case 'travel_advice':
      toast({
        title: "Travel Information",
        description: "Gathering travel safety information."
      });
      return `Here's the latest travel safety information for your destination.`;
      
    case 'cybersecurity_info':
      toast({
        title: "Cybersecurity Alert",
        description: "Checking latest security threats."
      });
      return `I'll provide you with the latest cybersecurity information and safety tips.`;
      
    case 'family_location':
      const familyMember = command.params?.member || 'family members';
      toast({
        title: "Family Locator",
        description: `Locating ${familyMember}.`
      });
      return `I'm checking the location of ${familyMember} now.`;
      
    case 'safe_route':
      toast({
        title: "Safe Route",
        description: "Calculating safest route to destination."
      });
      return `I'm calculating the safest route to your destination now.`;
      
    case 'help':
      return `I'm Soteria, your safety assistant. You can ask me to call emergency services, share your location, start recording evidence, or activate a silent alarm. What would you like me to do?`;
      
    case 'stop':
    case 'cancel':
      toast({
        title: "Command Cancelled",
        description: "Operation stopped."
      });
      return `I've stopped the current operation.`;
      
    case 'weather_alert':
      toast({
        title: "Weather Information",
        description: "Checking weather alerts."
      });
      return `I'm checking for weather alerts in your area.`;
      
    case 'medical_advice':
      toast({
        title: "Medical Information",
        description: "Providing medical guidance."
      });
      return `Here's some basic medical information. Remember to consult a healthcare professional for medical emergencies.`;
      
    case 'personal_safety':
      toast({
        title: "Safety Tips",
        description: "Providing personal safety advice."
      });
      return `Here are some personal safety tips for your situation.`;
      
    case 'conversation':
      // This should normally be handled by the openaiService in the voice-command-processor.ts
      // This is a fallback in case the OpenAI call fails
      return `I'm here to help with any safety or security concerns. What would you like to know?`;
      
    default:
      return `I didn't quite catch that. You can ask me to call for help, share your location, start recording, or activate a silent alarm.`;
  }
};
