
import { ThreatAlert } from '@/lib/supabase';
import { ThreatMarker } from '@/types/threats';

export const threatConverters = {
  threatAlertToMarker: (threat: ThreatAlert, userLocation?: [number, number]): ThreatMarker => {
    if (threat.location?.lat !== undefined && threat.location?.lng !== undefined) {
      return {
        id: threat.id,
        position: [threat.location.lat, threat.location.lng] as [number, number],
        level: threat.severity as 'low' | 'medium' | 'high',
        title: threat.title,
        details: threat.description,
        type: 'environmental'
      };
    }
    
    const baseLocation: [number, number] = userLocation || [37.7749, -122.4194];
    const randomOffset = () => (Math.random() - 0.5) * 5;
    
    let type: 'cyber' | 'physical' | 'environmental' = 'environmental';
    
    const threatText = (threat.title + ' ' + threat.description).toLowerCase();
    if (threatText.includes('hack') || threatText.includes('breach') || threatText.includes('cyber') || 
        threatText.includes('ransomware') || threatText.includes('data') || threatText.includes('password')) {
      type = 'cyber';
    } else if (threatText.includes('crime') || threatText.includes('theft') || threatText.includes('robbery') || 
              threatText.includes('assault') || threatText.includes('traffic') || threatText.includes('incident')) {
      type = 'physical';
    }
    
    return {
      id: threat.id,
      position: [baseLocation[0] + randomOffset(), baseLocation[1] + randomOffset()] as [number, number],
      level: threat.severity as 'low' | 'medium' | 'high',
      title: threat.title,
      details: threat.description,
      type
    };
  }
};
