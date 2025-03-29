
import axios from 'axios';
import { ThreatMarker } from '@/types/threats';

const FBI_API_KEY = 't5NXacoA61wMeasAq8XciJB9hhV0zYBsGb6WBNEM';
const FBI_API_URL = 'https://api.usa.gov/crime/fbi/sapi';

interface CrimeData {
  data_year: number;
  offense: string;
  actual_count: number;
  population: number;
  state_abbr: string;
  county_name: string;
}

interface ArrestData {
  data_year: number;
  offense: string;
  arrestee_count: number;
  population: number;
  state_abbr: string;
  county_name: string;
}

// Function to fetch crime data
const getCrimeData = async (
  state: string,
  county: string,
  offense: string,
  startYear: number,
  endYear: number
): Promise<CrimeData[]> => {
  try {
    const response = await axios.get(`${FBI_API_URL}/crimes/county/ Offense`, {
      params: {
        api_key: FBI_API_KEY,
        state,
        county,
        offense,
        start_year: startYear,
        end_year: endYear,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching crime data:', error);
    throw error;
  }
};

// Function to fetch arrest data
const getArrestData = async (
  state: string,
  county: string,
  offense: string,
  startYear: number,
  endYear: number
): Promise<ArrestData[]> => {
  try {
    const response = await axios.get(`${FBI_API_URL}/arrests/county/ Offense`, {
      params: {
        api_key: FBI_API_KEY,
        state,
        county,
        offense,
        start_year: startYear,
        end_year: endYear,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching arrest data:', error);
    throw error;
  }
};

// Convert crime data to threat markers for the map
export const getCrimeThreats = async (
  state: string,
  county: string,
  offense: string = 'all-crimes',
  startYear: number = 2020,
  endYear: number = 2020
): Promise<ThreatMarker[]> => {
  try {
    const threats: ThreatMarker[] = [];
    const crimeData = await getCrimeData(state, county, offense, startYear, endYear);

    crimeData.forEach((crime) => {
      // Determine threat level based on crime type and count
      let level: 'low' | 'medium' | 'high' = 'low';
      if (crime.offense === 'violent-crime' && crime.actual_count > 100) {
        level = 'high';
      } else if (crime.offense === 'property-crime' && crime.actual_count > 500) {
        level = 'medium';
      } else if (crime.actual_count > 1000) {
        level = 'medium';
      }

      // Mock position for the threat (replace with actual location data if available)
      const position: [number, number] = [
        37.7749 + Math.random() * 0.1 - 0.05,   // Latitude (San Francisco as base)
        -122.4194 + Math.random() * 0.1 - 0.05,  // Longitude
      ];

      threats.push({
        id: `crime-${crime.data_year}-${crime.offense}-${crime.actual_count}`,
        position,
        level,
        title: `Crime Alert: ${crime.offense}`,
        details: `In ${crime.county_name}, ${crime.state_abbr} during ${crime.data_year}, there were ${crime.actual_count} reported incidents of ${crime.offense}.`,
        type: 'physical',
      });
    });

    return threats;
  } catch (error) {
    console.error('Error processing crime threats:', error);
    return [];
  }
};

// Export the crime service as an object to match import in ThreatsMap.tsx
export const crimeService = {
  getCrimeThreats
};
