
import { VoiceCommandType } from '../types';

export const extractParameters = (text: string, commandType: VoiceCommandType): Record<string, any> => {
  const params: Record<string, any> = {};
  
  switch (commandType) {
    case 'emergency_call':
      // Extract emergency service type
      if (text.includes('police')) {
        params.service = 'police';
      } else if (text.includes('ambulance') || text.includes('medical')) {
        params.service = 'ambulance';
      } else if (text.includes('fire')) {
        params.service = 'fire';
      } else {
        params.service = 'general';
      }
      break;
      
    case 'location_share':
      // Extract contact information if mentioned
      const contactMatches = text.match(/(?:to|with)\s+([a-zA-Z\s]+)/);
      if (contactMatches) {
        params.contacts = contactMatches[1].trim();
      }
      break;
      
    case 'start_recording':
      // Extract recording type
      if (text.includes('video')) {
        params.type = 'video';
      } else if (text.includes('audio')) {
        params.type = 'audio';
      } else if (text.includes('photo')) {
        params.type = 'photo';
      } else {
        params.type = 'video'; // default
      }
      break;
      
    case 'travel_advice':
      // Extract destination if mentioned
      const destinationMatches = text.match(/(?:to|going to|traveling to)\s+([a-zA-Z\s,]+)/);
      if (destinationMatches) {
        params.destination = destinationMatches[1].trim();
      }
      break;
      
    case 'medical_advice':
      // Extract symptoms or medical issue
      const medicalMatches = text.match(/(?:have|feel|experiencing)\s+([a-zA-Z\s]+)/);
      if (medicalMatches) {
        params.symptoms = medicalMatches[1].trim();
      }
      break;
      
    default:
      // Extract any numerical values
      const numbers = text.match(/\d+/g);
      if (numbers) {
        params.numbers = numbers.map(n => parseInt(n));
      }
      break;
  }
  
  return params;
};
