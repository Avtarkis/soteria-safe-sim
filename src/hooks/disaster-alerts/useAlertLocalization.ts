
import { DisasterAlert } from '@/types/disasters';

export const useAlertLocalization = () => {
  const localizeAlerts = (alerts: DisasterAlert[], userLocation: [number, number] | null): DisasterAlert[] => {
    if (!userLocation) return alerts;
    
    const [lat, lng] = userLocation;
    const localizedAlerts = [...alerts];
    
    // Get region information based on latitude and longitude ranges
    const region = getRegionFromCoordinates(lat, lng);
    
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
  
  // Helper function to determine region from coordinates with global awareness
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
    return { 
      country: 'International', 
      region: getGeneralRegionName(lat, lng), 
      location: 'Current Location' 
    };
  };
  
  // Get a general region name when no specific region is detected
  const getGeneralRegionName = (lat: number, lng: number): string => {
    // Northern Hemisphere regions
    if (lat > 0) {
      if (lng > -20 && lng < 60) return "Northern Africa/Middle East";
      if (lng > 60 && lng < 180) return "Northern Asia/Pacific";
      return "Northern Americas";
    }
    // Southern Hemisphere regions
    else {
      if (lng > -20 && lng < 60) return "Southern Africa";
      if (lng > 60 && lng < 180) return "Oceania/Pacific";
      return "Southern Americas";
    }
  };
  
  // Helper function to generate local weather events based on coordinates
  const getLocalEvent = (lat: number, lng: number): { title: string; type: 'earthquake' | 'wildfire' | 'flood' | 'storm' | 'extreme_heat'; description: string } | null => {
    const currentMonth = new Date().getMonth(); // 0-indexed (0 = January)
    const currentSeason = getSeason(lat, currentMonth);
    
    // Nigeria specific events
    if (lat > 4 && lat < 14 && lng > 2 && lng < 15) {
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
    }
    // Northern Hemisphere
    else if (lat > 0) {
      if (currentSeason === 'summer') {
        // Summer events in northern hemisphere
        if (lat > 30 && lat < 50) { // Temperate zones
          return {
            title: 'Heat Advisory',
            type: 'extreme_heat',
            description: 'High temperatures expected over the next 48 hours. Stay hydrated and avoid prolonged sun exposure.'
          };
        } else if (lat > 10 && lat < 30) { // Subtropical zones
          return {
            title: 'Monsoon Alert',
            type: 'flood',
            description: 'Heavy seasonal rains may affect the region. Be prepared for possible flash flooding.'
          };
        }
      } else if (currentSeason === 'winter') {
        // Winter events in northern hemisphere
        if (lat > 40) { // Higher latitudes
          return {
            title: 'Winter Storm Warning',
            type: 'storm',
            description: 'Heavy snowfall and strong winds expected. Travel may be difficult or impossible.'
          };
        }
      } else if (currentSeason === 'spring') {
        // Spring events
        if (lat > 30 && lat < 45 && lng > -110 && lng < -80) { // US tornado alley
          return {
            title: 'Severe Weather Alert',
            type: 'storm',
            description: 'Conditions are favorable for thunderstorm development. Be alert for possible tornado warnings.'
          };
        }
      }
    }
    // Southern Hemisphere
    else {
      if (currentSeason === 'summer') {
        // Summer events in southern hemisphere
        if (lat < -30) { // Australia, South Africa, etc.
          return {
            title: 'Bushfire Danger',
            type: 'wildfire',
            description: 'High temperatures and dry conditions increase fire risk. Follow local authorities\' instructions.'
          };
        }
      } else if (currentSeason === 'winter') {
        // Winter events in southern hemisphere
        if (lat < -20 && lat > -35 && lng > 135 && lng < 155) { // Eastern Australia
          return {
            title: 'Coastal Flood Warning',
            type: 'flood',
            description: 'High tides and coastal flooding possible along eastern shorelines.'
          };
        }
      }
    }
    
    // General season-based alert when no specific condition matches
    return getGeneralSeasonalAlert(lat, currentSeason);
  };
  
  // Get season based on hemisphere and month
  const getSeason = (latitude: number, month: number): 'winter' | 'spring' | 'summer' | 'autumn' => {
    // Northern hemisphere
    if (latitude >= 0) {
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'autumn';
      return 'winter';
    } 
    // Southern hemisphere (seasons reversed)
    else {
      if (month >= 2 && month <= 4) return 'autumn';
      if (month >= 5 && month <= 7) return 'winter';
      if (month >= 8 && month <= 10) return 'spring';
      return 'summer';
    }
  };
  
  // Get general seasonal alert when no specific region condition matches
  const getGeneralSeasonalAlert = (latitude: number, season: string): { title: string; type: 'earthquake' | 'wildfire' | 'flood' | 'storm' | 'extreme_heat'; description: string } | null => {
    switch (season) {
      case 'summer':
        return {
          title: latitude > 0 ? 'Summer Heat Advisory' : 'Summer Weather Alert',
          type: 'extreme_heat',
          description: 'Stay hydrated and limit outdoor exposure during peak heat hours.'
        };
      case 'winter':
        return {
          title: latitude > 0 ? 'Winter Weather Advisory' : 'Winter Storm Watch',
          type: 'storm',
          description: 'Be prepared for changing weather conditions and possible precipitation.'
        };
      case 'spring':
        return {
          title: 'Seasonal Storm Alert',
          type: 'storm',
          description: 'Spring weather patterns may bring rapidly changing conditions and thunderstorms.'
        };
      case 'autumn':
        return {
          title: 'Seasonal Weather Change',
          type: 'storm',
          description: 'Autumn weather changes may cause strong winds and increased rainfall.'
        };
      default:
        return null;
    }
  };

  return { localizeAlerts };
};
