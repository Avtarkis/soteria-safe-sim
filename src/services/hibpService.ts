
import axios from 'axios';
import { ThreatMarker } from '@/types/threats';

const HIBP_API_URL = 'https://haveibeenpwned.com/api/v3';
// You would need to use a real API key in production
const HIBP_API_KEY = 'YOUR_HIBP_API_KEY'; 

export interface BreachData {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  LogoPath: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
}

export const hibpService = {
  // Check if an email has been pwned in breaches
  checkBreaches: async (email: string): Promise<BreachData[]> => {
    try {
      const response = await axios.get(`${HIBP_API_URL}/breachedaccount/${encodeURIComponent(email)}`, {
        headers: {
          'hibp-api-key': HIBP_API_KEY,
          'User-Agent': 'Soteria Security App'
        }
      });
      
      return response.data;
    } catch (error) {
      // 404 means no breaches found (which is good)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      
      console.error('Error checking HaveIBeenPwned:', error);
      throw error;
    }
  },
  
  // Get details about a specific breach
  getBreachDetails: async (breachName: string): Promise<BreachData> => {
    try {
      const response = await axios.get(`${HIBP_API_URL}/breach/${encodeURIComponent(breachName)}`, {
        headers: {
          'hibp-api-key': HIBP_API_KEY,
          'User-Agent': 'Soteria Security App'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting breach details for ${breachName}:`, error);
      throw error;
    }
  },
  
  // Get all breach data from HIBP
  getAllBreaches: async (): Promise<BreachData[]> => {
    try {
      const response = await axios.get(`${HIBP_API_URL}/breaches`, {
        headers: {
          'hibp-api-key': HIBP_API_KEY,
          'User-Agent': 'Soteria Security App'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting all breaches:', error);
      throw error;
    }
  },
  
  // Convert breaches to threat markers for visualization
  getBreachThreats: async (email: string): Promise<ThreatMarker[]> => {
    try {
      const breaches = await hibpService.checkBreaches(email);
      const threats: ThreatMarker[] = [];
      
      // Default coordinates if no real location data is available
      // This is just a mock implementation since breach data doesn't have location info
      const mockPositions: [number, number][] = [
        [40.7128, -74.0060], // NYC
        [34.0522, -118.2437], // LA
        [41.8781, -87.6298], // Chicago
        [51.5074, -0.1278], // London
        [48.8566, 2.3522], // Paris
      ];
      
      // Process each breach as a cyber threat
      breaches.forEach((breach, index) => {
        // Determine threat level based on breach size and sensitivity
        let level: 'low' | 'medium' | 'high' = 'low';
        
        if (breach.IsSensitive || breach.PwnCount > 10000000) {
          level = 'high';
        } else if (breach.PwnCount > 1000000) {
          level = 'medium';
        }
        
        // Create a threat marker for the breach
        // Use a modulo operation to cycle through mock positions
        const position = mockPositions[index % mockPositions.length];
        
        threats.push({
          id: `breach-${breach.Name}-${Date.now()}`,
          position,
          level,
          title: `Data Breach: ${breach.Title}`,
          details: `Your email was found in the ${breach.Title} breach which contained ${breach.PwnCount.toLocaleString()} accounts. The breach occurred on ${breach.BreachDate} and exposed: ${breach.DataClasses.join(', ')}.`,
          type: 'cyber'
        });
      });
      
      return threats;
    } catch (error) {
      console.error('Error processing breach threats:', error);
      return [];
    }
  }
};

// Create a hook to check for breaches
export const useBreachCheck = () => {
  const checkEmail = async (email: string) => {
    try {
      const breaches = await hibpService.checkBreaches(email);
      return {
        isBreached: breaches.length > 0,
        breachCount: breaches.length,
        breaches
      };
    } catch (error) {
      console.error('Error in breach check hook:', error);
      return {
        isBreached: false,
        breachCount: 0,
        breaches: []
      };
    }
  };
  
  return { checkEmail };
};
