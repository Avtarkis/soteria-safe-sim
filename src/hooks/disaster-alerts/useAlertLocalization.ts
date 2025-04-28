
import { DisasterAlert } from '@/types/disasters';

export const useAlertLocalization = () => {
  const localizeAlerts = (alerts: DisasterAlert[], userLocation: [number, number] | null): DisasterAlert[] => {
    if (!userLocation) return alerts;
    
    const [lat, lng] = userLocation;
    const localizedAlerts = [...alerts];
    
    // Get region information based on latitude and longitude ranges
    const region = getRegionFromCoordinates(lat, lng);
    
    localizedAlerts.forEach(alert => {
      // Apply the detected region to all alerts
      if (region) {
        alert.country = region.country;
        alert.region = region.region;
        alert.location = region.location;
      }
      
      // Add some nearby-specific alerts
      const localEvent = getLocalEvent(lat, lng);
      if (localEvent) {
        const localAlert: DisasterAlert = {
          id: `local-${Date.now()}`,
          title: localEvent.title,
          type: localEvent.type,
          severity: 'watch',
          location: region?.location || 'Your area',
          coordinates: [lat, lng],
          description: localEvent.description,
          date: new Date().toISOString(),
          source: 'Local Weather Service',
          active: true,
          country: region?.country || 'Your Country',
          region: region?.region || 'Your Region',
        };
        
        // Replace one of the remote alerts with this local one
        if (localizedAlerts.length > 2) {
          localizedAlerts[localizedAlerts.length - 1] = localAlert;
        } else {
          localizedAlerts.push(localAlert);
        }
      }
    });
    
    return localizedAlerts;
  };
  
  // Helper function to determine region from coordinates
  const getRegionFromCoordinates = (lat: number, lng: number): { country: string; region: string; location: string } | null => {
    // North America
    if (lat > 24 && lat < 50 && lng > -125 && lng < -66) {
      if (lat > 40 && lat < 50 && lng > -80 && lng < -70) {
        return { country: 'United States', region: 'Northeast', location: 'New York Area' };
      } else if (lat > 32 && lat < 42 && lng > -125 && lng < -115) {
        return { country: 'United States', region: 'West Coast', location: 'California' };
      } else if (lat > 30 && lat < 40 && lng > -100 && lng < -90) {
        return { country: 'United States', region: 'Southern', location: 'Texas' };
      }
    }
    
    // Europe
    if (lat > 35 && lat < 60 && lng > -10 && lng < 30) {
      if (lat > 48 && lat < 55 && lng > -5 && lng < 10) {
        return { country: 'United Kingdom', region: 'Western Europe', location: 'London Area' };
      } else if (lat > 40 && lat < 48 && lng > 0 && lng < 10) {
        return { country: 'France', region: 'Western Europe', location: 'Paris Area' };
      } else if (lat > 45 && lat < 55 && lng > 5 && lng < 15) {
        return { country: 'Germany', region: 'Central Europe', location: 'Berlin Area' };
      }
    }
    
    // Africa
    if (lat > -35 && lat < 15 && lng > -20 && lng < 50) {
      if (lat > 5 && lat < 15 && lng > 0 && lng < 15) {
        return { country: 'Nigeria', region: 'West Africa', location: 'Lagos Area' };
      } else if (lat > -35 && lat < -25 && lng > 15 && lng < 35) {
        return { country: 'South Africa', region: 'Southern Africa', location: 'Cape Town Area' };
      } else if (lat > -5 && lat < 5 && lng > 30 && lng < 45) {
        return { country: 'Kenya', region: 'East Africa', location: 'Nairobi Area' };
      }
    }
    
    // Asia
    if (lat > 0 && lat < 60 && lng > 60 && lng < 180) {
      if (lat > 10 && lat < 25 && lng > 70 && lng < 90) {
        return { country: 'India', region: 'South Asia', location: 'Mumbai Area' };
      } else if (lat > 30 && lat < 45 && lng > 110 && lng < 130) {
        return { country: 'China', region: 'East Asia', location: 'Beijing Area' };
      } else if (lat > 30 && lat < 40 && lng > 125 && lng < 145) {
        return { country: 'Japan', region: 'East Asia', location: 'Tokyo Area' };
      }
    }
    
    // Australia/Oceania
    if (lat > -50 && lat < -10 && lng > 110 && lng < 180) {
      if (lat > -40 && lat < -30 && lng > 140 && lng < 155) {
        return { country: 'Australia', region: 'Oceania', location: 'Sydney Area' };
      } else if (lat > -45 && lat < -35 && lng > 165 && lng < 180) {
        return { country: 'New Zealand', region: 'Oceania', location: 'Auckland Area' };
      }
    }
    
    // South America
    if (lat > -60 && lat < 10 && lng > -80 && lng < -30) {
      if (lat > -25 && lat < -15 && lng > -50 && lng < -40) {
        return { country: 'Brazil', region: 'South America', location: 'São Paulo Area' };
      } else if (lat > -35 && lat < -30 && lng > -65 && lng < -55) {
        return { country: 'Argentina', region: 'South America', location: 'Buenos Aires Area' };
      }
    }
    
    return null;
  };
  
  // Helper function to generate local weather events based on coordinates
  const getLocalEvent = (lat: number, lng: number): { title: string; type: 'earthquake' | 'wildfire' | 'flood' | 'storm' | 'extreme_heat'; description: string } | null => {
    // Simple algorithm to create region-specific events based on geographical location
    
    // Generate events for specific regions
    // North America - more likely to get storms and extreme heat
    if (lat > 24 && lat < 50 && lng > -125 && lng < -66) {
      if (lat > 30 && lat < 40 && lng > -100 && lng < -90) { // Southern US
        return {
          title: 'Heat Advisory',
          type: 'extreme_heat',
          description: 'High temperatures expected over the next 48 hours. Stay hydrated and avoid prolonged sun exposure.'
        };
      } else if (lat > 25 && lat < 35 && lng > -85 && lng < -75) { // Southeast US
        return {
          title: 'Thunderstorm Watch',
          type: 'storm',
          description: 'Thunderstorms possible in your area. Monitor local weather updates.'
        };
      }
    }
    
    // Europe - more likely to get floods
    if (lat > 35 && lat < 60 && lng > -10 && lng < 30) {
      if (lat > 48 && lat < 55 && lng > -5 && lng < 10) { // UK
        return {
          title: 'Heavy Rain Warning',
          type: 'flood',
          description: 'Persistent rain may lead to localized flooding. Exercise caution when traveling.'
        };
      }
    }
    
    // Africa
    if (lat > -35 && lat < 15 && lng > -20 && lng < 50) {
      if (lat > 5 && lat < 15 && lng > 0 && lng < 15) { // West Africa
        return {
          title: 'Heavy Rainfall Alert',
          type: 'flood',
          description: 'Heavy rainfall expected in parts of West Africa. Stay informed about local conditions.'
        };
      }
    }
    
    // Asia - earthquakes more common in certain regions
    if (lat > 0 && lat < 60 && lng > 60 && lng < 180) {
      if (lat > 30 && lat < 40 && lng > 125 && lng < 145) { // Japan
        return {
          title: 'Earthquake Advisory',
          type: 'earthquake',
          description: 'Seismic activity detected offshore. No immediate danger but stay alert.'
        };
      }
    }
    
    // Australia/Oceania - wildfires during dry season
    if (lat > -50 && lat < -10 && lng > 110 && lng < 180) {
      if (lat > -40 && lat < -30 && lng > 140 && lng < 155) { // Eastern Australia
        return {
          title: 'Fire Danger Rating',
          type: 'wildfire',
          description: 'Elevated fire danger due to dry conditions. Follow local fire restrictions.'
        };
      }
    }
    
    return null;
  };

  return { localizeAlerts };
};
