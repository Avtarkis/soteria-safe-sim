
import { VoiceCommandType } from './types';

export const extractParameters = (text: string, commandType: VoiceCommandType): Record<string, string> => {
  const params: Record<string, string> = {};
  
  switch (commandType) {
    case 'emergency_call':
      const serviceMatch = text.match(/call\s+(\w+)/);
      if (serviceMatch) params.service = serviceMatch[1];
      break;
      
    case 'location_share':
      const contactMatch = text.match(/share\s+(?:with|to)\s+(\w+)/);
      if (contactMatch) params.contact = contactMatch[1];
      break;
  }
  
  return params;
};
