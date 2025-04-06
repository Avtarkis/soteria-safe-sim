
import { weatherService } from '@/services/weatherService';
import { ThreatMarker } from '@/types/threats';

export const useNearbyData = () => {
  const fetchNearbyData = async (userLocation: [number, number]): Promise<ThreatMarker[]> => {
    try {
      // Create nearby locations for better coverage of weather and other data
      const nearbyLocations = [
        `${userLocation[0]},${userLocation[1]}`, // Exact location
        `${userLocation[0] + 0.02},${userLocation[1]}`, // Slightly north
        `${userLocation[0]},${userLocation[1] + 0.02}`, // Slightly east
      ];
      
      // Get weather data for the area
      const weatherThreats = await weatherService.getWeatherThreats(nearbyLocations);
      
      // Place weather threats very close to user location to make them relevant
      const localizedWeatherThreats = weatherThreats.map(threat => ({
        ...threat,
        position: [
          userLocation[0] + (Math.random() * 0.003 - 0.0015), 
          userLocation[1] + (Math.random() * 0.003 - 0.0015)
        ] as [number, number]
      }));
      
      // Fetch location information to get the area name
      let areaThreats: ThreatMarker[] = [];
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation[0]}&lon=${userLocation[1]}`
        );
        const data = await response.json();
        
        const state = data?.address?.state || '';
        const county = data?.address?.county || '';
        const city = data?.address?.city || '';
        
        // Generate some region-specific but non-alarming threats
        if (state || county || city) {
          areaThreats = getAreaSpecificThreats(userLocation, state, county, city);
        }
      } catch (error) {
        console.error('Error getting location info:', error);
      }
      
      return [...localizedWeatherThreats, ...areaThreats];
    } catch (error) {
      console.error('Error fetching nearby data:', error);
      return [];
    }
  };
  
  // Generate area-specific but non-alarming threats
  const getAreaSpecificThreats = (
    userLocation: [number, number],
    state: string,
    county: string,
    city: string
  ): ThreatMarker[] => {
    const locationName = city || county || state;
    if (!locationName) return [];
    
    // Only create 1-2 threats with a moderate chance
    if (Math.random() > 0.3) return [];
    
    const threats: ThreatMarker[] = [];
    
    // Add a community notification (non-alarming)
    threats.push({
      id: `local-info-${Date.now()}`,
      position: [
        userLocation[0] + (Math.random() * 0.003 - 0.0015),
        userLocation[1] + (Math.random() * 0.003 - 0.0015)
      ],
      level: 'low' as 'low',
      title: 'Local Community Notice',
      details: `Stay informed about ${locationName} community updates and events.`,
      type: 'physical'
    });
    
    return threats;
  };

  return { fetchNearbyData };
};
