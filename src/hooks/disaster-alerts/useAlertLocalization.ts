import { DisasterAlert } from '@/types/disasters';

export const useAlertLocalization = () => {
  const localizeAlerts = (alerts: DisasterAlert[], userLocation: [number, number] | null): DisasterAlert[] => {
    if (!userLocation) return alerts;
    
    const [lat, lng] = userLocation;
    const localizedAlerts = [...alerts];
    
    // Get region information based on latitude and longitude ranges
    const region = getRegionFromCoordinates(lat, lng);
    
    // Create new localized alerts based on user's region
    const localizedEvents = [];
    
    // Apply detected region to existing alerts
    localizedAlerts.forEach(alert => {
      if (region) {
        alert.country = region.country;
        alert.region = region.region;
        alert.location = region.location;
      }
    });
    
    // Add region-specific local alerts based on geographic location
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
      
      // Replace one remote alert with this local one
      if (localizedAlerts.length > 2) {
        localizedAlerts[1] = localAlert;
      } else {
        localizedAlerts.unshift(localAlert);
      }
    }
    
    return localizedAlerts;
  };
  
  // Helper function to determine region from coordinates with expanded Africa regions
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
    
    // Africa - Enhanced Nigeria regions
    if (lat > -35 && lat < 38 && lng > -20 && lng < 55) {
      // Nigeria - specific regions
      if (lat > 6 && lat < 14 && lng > 2 && lng < 15) {
        // Northern Nigeria
        if (lat > 10 && lat < 14) {
          return { country: 'Nigeria', region: 'Northern Nigeria', location: 'Kano Region' };
        }
        // Middle Belt
        else if (lat > 8 && lat < 10) {
          return { country: 'Nigeria', region: 'Middle Belt', location: 'Abuja Region' };
        }
        // Southern Nigeria
        else if (lat > 6 && lat < 8 && lng > 2 && lng < 10) {
          return { country: 'Nigeria', region: 'Southern Nigeria', location: 'Lagos Region' };
        }
        // Eastern Nigeria
        else if (lat > 4 && lat < 7 && lng > 7 && lng < 10) {
          return { country: 'Nigeria', region: 'Eastern Nigeria', location: 'Port Harcourt Region' };
        }
        else {
          return { country: 'Nigeria', region: 'Central Nigeria', location: 'Jos Plateau' };
        }
      }
      // Other African regions
      else if (lat > -5 && lat < 5 && lng > 30 && lng < 45) {
        return { country: 'Kenya', region: 'East Africa', location: 'Nairobi Area' };
      }
      else if (lat > -35 && lat < -25 && lng > 15 && lng < 35) {
        return { country: 'South Africa', region: 'Southern Africa', location: 'Cape Town Area' };
      }
      else if (lat > 25 && lat < 35 && lng > -10 && lng < 10) {
        return { country: 'Morocco', region: 'North Africa', location: 'Casablanca Area' };
      }
      else if (lat > 5 && lat < 20 && lng > -20 && lng < 0) {
        return { country: 'Senegal', region: 'West Africa', location: 'Dakar Area' };
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
    
    // Default global region
    return { country: 'Global', region: 'Global', location: 'Current Location' };
  };
  
  // Helper function to generate local weather events based on coordinates with enhanced Nigeria focus
  const getLocalEvent = (lat: number, lng: number): { title: string; type: 'earthquake' | 'wildfire' | 'flood' | 'storm' | 'extreme_heat'; description: string } | null => {
    // Nigeria specific events
    if (lat > 4 && lat < 14 && lng > 2 && lng < 15) {
      const currentMonth = new Date().getMonth(); // 0-indexed (0 = January)
      
      // Rainy season in southern Nigeria (April to October)
      if (currentMonth >= 3 && currentMonth <= 9 && lat < 9) {
        return {
          title: 'Heavy Rainfall Warning',
          type: 'flood',
          description: 'Heavy rainfall expected in parts of Southern Nigeria. Risk of flash flooding in low-lying areas.'
        };
      }
      
      // Harmattan season (December to February)
      else if ((currentMonth >= 11 || currentMonth <= 1) && lat > 9) {
        return {
          title: 'Harmattan Advisory',
          type: 'extreme_heat',
          description: 'Dry, dusty Harmattan winds affecting Northern Nigeria. Reduced visibility and respiratory concerns possible.'
        };
      }
      
      // Dry season extreme heat (February to April in Northern Nigeria)
      else if (currentMonth >= 1 && currentMonth <= 3 && lat > 9) {
        return {
          title: 'Extreme Heat Warning',
          type: 'extreme_heat',
          description: 'Very high temperatures expected across Northern Nigeria. Stay hydrated and avoid prolonged sun exposure.'
        };
      }
      
      // Early rainy season storms in Middle Belt (March-April)
      else if (currentMonth >= 2 && currentMonth <= 3 && lat > 7 && lat < 10) {
        return {
          title: 'Thunderstorm Warning',
          type: 'storm',
          description: 'Severe thunderstorms with lightning expected across Nigeria\'s Middle Belt region.'
        };
      }
      
      // Coastal flooding concerns (Lagos and coastal areas)
      else if (lat < 7 && lng < 5) {
        return {
          title: 'Coastal Flooding Alert',
          type: 'flood',
          description: 'Elevated risk of coastal flooding in Lagos and surrounding areas due to high tides.'
        };
      }
    }
    
    // Other African regions
    else if (lat > -35 && lat < 38 && lng > -20 && lng < 55) {
      // East Africa
      if (lat > -5 && lat < 5 && lng > 30 && lng < 45) {
        return {
          title: 'Seasonal Rain Warning',
          type: 'flood',
          description: 'Heavy seasonal rains may cause flooding in parts of East Africa.'
        };
      }
      // Southern Africa
      else if (lat > -35 && lat < -25 && lng > 15 && lng < 35) {
        return {
          title: 'Drought Conditions',
          type: 'extreme_heat',
          description: 'Ongoing drought conditions affecting water supplies in Southern Africa.'
        };
      }
    }
    
    // Default to standard regional events for other areas
    // North America - more likely to get storms and extreme heat
    if (lat > 24 && lat < 50 && lng > -125 && lng < -66) {
      if (lat > 30 && lat < 40 && lng > -100 && lng < -90) { // Southern US
        return {
          title: 'Heat Advisory',
          type: 'extreme_heat',
          description: 'High temperatures expected over the next 48 hours. Stay hydrated and avoid prolonged sun exposure.'
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
    
    return null;
  };

  return { localizeAlerts };
};
