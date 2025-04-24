
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
      
    case 'conversation':
      return `I'm here to help. You can ask me to call emergency services, share your location, start recording, or activate a silent alarm.`;
      
    default:
      return `I didn't quite catch that. You can ask me to call for help, share your location, start recording, or activate a silent alarm.`;
  }
};
