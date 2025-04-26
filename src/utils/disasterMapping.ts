
import { DisasterAlertType, DisasterAlertSeverity } from '@/types/disasters';

export const mapDisasterType = (reliefWebType: string): DisasterAlertType => {
  const typeMap: Record<string, DisasterAlertType> = {
    'Earthquake': 'earthquake',
    'Flood': 'flood',
    'Wildfire': 'wildfire',
    'Storm': 'storm',
    'Tropical Cyclone': 'storm',
    'Hurricane': 'storm',
    'Typhoon': 'storm',
    'Extreme Heat': 'extreme_heat',
    'Heat Wave': 'extreme_heat'
  };

  return typeMap[reliefWebType] || 'flood';
};

export const mapSeverity = (title: string, body: string): DisasterAlertSeverity => {
  const text = (title + ' ' + body).toLowerCase();
  
  if (text.includes('urgent') || text.includes('emergency') || text.includes('severe') || 
      text.includes('critical') || text.includes('evacuate') || text.includes('deadly')) {
    return 'warning';
  }
  
  if (text.includes('watch') || text.includes('monitor') || text.includes('alert') || 
      text.includes('prepare')) {
    return 'watch';
  }
  
  return 'advisory';
};
