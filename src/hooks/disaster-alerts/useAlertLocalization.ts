import { DisasterAlert } from '@/types/disasters';

export const useAlertLocalization = () => {
  const localizeAlerts = (alerts: DisasterAlert[], userLocation: [number, number] | null): DisasterAlert[] => {
    if (!userLocation) return alerts;
    
    const [lat, lng] = userLocation;
    
    // Get region information based on latitude and longitude ranges
    const region = getRegionFromCoordinates(lat, lng);
    
    // Filter out alerts that are clearly not relevant to the user's location
    // and localize the remaining ones
    const localizedAlerts = alerts
      .filter(alert => {
        // If the alert has coordinates, check if it's within reasonable distance (roughly 300km)
        if (alert.coordinates && Array.isArray(alert.coordinates) && alert.coordinates.length === 2) {
          const distance = calculateDistance(
            lat, lng, 
            alert.coordinates[0], alert.coordinates[1]
          );
          return distance < 300; // Keep alerts within 300km
        }
        return true; // Keep alerts without coordinates (we'll filter further by location name)
      })
      .map(alert => {
        // Create a new alert object to avoid modifying the original
        const localizedAlert = { ...alert };
        
        // If we have region info, and the alert doesn't have specific coordinates
        // or its title/location doesn't match the user's region, localize it
        if (region) {
          // Check if alert title/location already contains user's location info
          const alertLocationText = (alert.title + ' ' + alert.location).toLowerCase();
          const regionText = (region.location + ' ' + region.region + ' ' + region.country).toLowerCase();
          
          // If alert doesn't seem to be about the user's location, adapt it
          if (!containsLocationMatch(alertLocationText, regionText)) {
            // For NASA EONET data that has location in the title but wrong region
            if (alert.source === 'NASA EONET') {
              // Keep the alert type but localize the location
              const alertType = extractAlertType(alert.title);
              if (alertType) {
                localizedAlert.title = `${alertType} in ${region.location}`;
                localizedAlert.location = region.location;
                localizedAlert.region = region.region;
                localizedAlert.country = region.country;
              }
            } else {
              // For other alerts, just update the location information
              localizedAlert.location = region.location;
              localizedAlert.region = region.region;
              localizedAlert.country = region.country;
            }
          }
        }
        
        return localizedAlert;
      });
    
    // Add region-specific local alerts based on geographic location
    const localEvent = getLocalEvent(lat, lng);
    if (localEvent && region) {
      const localAlert: DisasterAlert = {
        id: `local-${Date.now()}`,
        title: localEvent.title,
        type: localEvent.type,
        severity: 'watch',
        location: region.location,
        coordinates: [lat, lng],
        description: localEvent.description,
        date: new Date().toISOString(),
        source: 'Local Weather Service',
        active: true,
        country: region.country,
        region: region.region,
      };
      
      // Add the local alert to the beginning of the array
      localizedAlerts.unshift(localAlert);
    }
    
    // Further filter to remove duplicate alert types for the same region
    const uniqueLocalizedAlerts = removeDuplicateAlertTypes(localizedAlerts);
    
    return uniqueLocalizedAlerts;
  };
  
  // Calculate distance between two coordinates using the Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };
  
  // Check if alert location contains parts of user's region
  const containsLocationMatch = (alertLocation: string, userRegion: string): boolean => {
    const userRegionParts = userRegion.split(' ');
    // Check if any significant part of the user's region is in the alert location
    return userRegionParts.some(part => 
      part.length > 3 && alertLocation.includes(part.toLowerCase())
    );
  };
  
  // Extract the alert type from EONET title (e.g., "Wildfire" from "Rx Polk 2469 Wildfire, Polk, Texas")
  const extractAlertType = (title: string): string | null => {
    const alertTypes = [
      'Wildfire', 'Flood', 'Earthquake', 'Hurricane', 'Tornado', 'Storm',
      'Drought', 'Volcanic Activity', 'Landslide', 'Extreme Temperature'
    ];
    
    for (const type of alertTypes) {
      if (title.includes(type)) {
        return type;
      }
    }
    return null;
  };
  
  // Remove duplicate alert types for the same region
  const removeDuplicateAlertTypes = (alerts: DisasterAlert[]): DisasterAlert[] => {
    const uniqueAlerts: DisasterAlert[] = [];
    const seenTypes = new Map<string, boolean>();
    
    alerts.forEach(alert => {
      const key = `${alert.type}-${alert.location}`;
      if (!seenTypes.has(key)) {
        seenTypes.set(key, true);
        uniqueAlerts.push(alert);
      }
    });
    
    return uniqueAlerts;
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
    
    // Default global region - improved with more specific naming
    return { 
      country: 'International', 
      region: getGeneralRegionName(lat, lng), 
      location: getNearestCityName(lat, lng) 
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
  
  // Get nearest major city name based on coordinates
  const getNearestCityName = (lat: number, lng: number): string => {
    // Simplified world cities database with major cities
    const cities = [
      { name: "New York", lat: 40.7128, lng: -74.0060 },
      { name: "London", lat: 51.5074, lng: -0.1278 },
      { name: "Paris", lat: 48.8566, lng: 2.3522 },
      { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
      { name: "Sydney", lat: -33.8688, lng: 151.2093 },
      { name: "Lagos", lat: 6.5244, lng: 3.3792 },
      { name: "Cairo", lat: 30.0444, lng: 31.2357 },
      { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
      { name: "Beijing", lat: 39.9042, lng: 116.4074 },
      { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
      { name: "Mexico City", lat: 19.4326, lng: -99.1332 },
      { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
      { name: "Chicago", lat: 41.8781, lng: -87.6298 },
      { name: "Houston", lat: 29.7604, lng: -95.3698 },
      { name: "Berlin", lat: 52.5200, lng: 13.4050 },
      { name: "Madrid", lat: 40.4168, lng: -3.7038 },
      { name: "Kano", lat: 12.0022, lng: 8.5920 },
      { name: "Abuja", lat: 9.0765, lng: 7.3986 },
      { name: "Port Harcourt", lat: 4.8156, lng: 7.0498 }
    ];
    
    // Find nearest city
    let nearestCity = "Current Location";
    let minDistance = Number.MAX_VALUE;
    
    for (const city of cities) {
      const distance = calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city.name;
      }
    }
    
    return nearestCity + " Area";
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
