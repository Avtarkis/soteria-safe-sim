
import { VoiceCommandType } from '../types';

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
      
    case 'family_location':
      // Extract family member names
      const familyMembers = ['grandma', 'grandpa', 'mom', 'dad', 'mother', 'father', 'sister', 'brother', 'son', 'daughter'];
      for (const member of familyMembers) {
        if (text.toLowerCase().includes(member)) {
          params.member = member;
          break;
        }
      }
      break;
      
    case 'conversation':
      // Extract any potentially useful parameters from the conversation
      // For example, looking for locations, names, or specific topics
      const locationMatch = text.match(/(?:in|at|near)\s+([A-Za-z\s]+)(?:\s|$|\.)/);
      if (locationMatch) params.location = locationMatch[1].trim();
      
      // Extract names
      const nameMatch = text.match(/(?:is|about|for)\s+([A-Z][a-z]+)(?:\s|$|\.)/);
      if (nameMatch) params.name = nameMatch[1];
      break;
  }
  
  return params;
};
