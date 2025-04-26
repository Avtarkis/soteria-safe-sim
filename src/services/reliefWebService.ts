
import axios from 'axios';
import { DisasterAlert, DisasterAlertType, DisasterAlertSeverity } from '@/types/disasters';

const RELIEFWEB_API_URL = 'https://api.reliefweb.int/v1/reports';
const APP_NAME = 'soteria-app';

interface ReliefWebReport {
  id: string;
  fields: {
    title: string;
    country: { name: string, shortname: string }[];
    primary_country: { name: string, shortname: string };
    date: {
      created: string;
    };
    source: { name: string }[];
    disaster_type: { name: string, primary: boolean }[];
    body: string;
    url_alias: string;
  };
}

interface ReliefWebResponse {
  data: {
    totalCount: number;
    time: number;
    items: ReliefWebReport[];
  };
}

export const reliefWebService = {
  // Map ReliefWeb disaster types to our app's disaster types
  mapDisasterType: (reliefWebType: string): DisasterAlertType => {
    const typeMap: Record<string, DisasterAlertType> = {
      'Earthquake': 'earthquake',
      'Flood': 'flood',
      'Wildfire': 'wildfire',
      'Storm': 'storm',
      'Tropical Cyclone': 'storm',
      'Hurricane': 'storm',
      'Typhoon': 'storm',
      'Drought': 'extreme_heat',
      'Heat Wave': 'extreme_heat',
    };

    return typeMap[reliefWebType] || 'flood'; // Default to flood if type not recognized
  },

  // Map ReliefWeb severity to our app's severity
  mapSeverity: (title: string, body: string): DisasterAlertSeverity => {
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
  },

  // Convert ReliefWeb report to our DisasterAlert format
  convertReportToAlert: (report: ReliefWebReport): DisasterAlert => {
    // Find primary disaster type if available, otherwise use the first one
    const disasterType = report.fields.disaster_type?.find(dt => dt.primary)?.name || 
                        (report.fields.disaster_type?.[0]?.name || 'Flood');
    
    const mappedType = reliefWebService.mapDisasterType(disasterType);
    const mappedSeverity = reliefWebService.mapSeverity(
      report.fields.title, 
      report.fields.body || ''
    );

    const location = report.fields.primary_country?.name || 
                    (report.fields.country?.[0]?.name || 'Global');

    const region = report.fields.country?.length > 1 ? 
                  report.fields.country[1].name : '';

    return {
      id: report.id,
      title: report.fields.title,
      type: mappedType,
      severity: mappedSeverity,
      location,
      coordinates: [0, 0], // ReliefWeb doesn't provide exact coordinates
      description: report.fields.body || 'No details available',
      date: report.fields.date.created,
      source: report.fields.source?.[0]?.name || 'ReliefWeb',
      active: true,
      country: report.fields.primary_country?.name || 'Global',
      region: region || 'Unknown',
      url: `https://reliefweb.int/report/${report.fields.url_alias}`
    };
  },

  // Fetch disaster alerts from ReliefWeb API
  fetchDisasterAlerts: async (
    userCountry?: string,
    limit: number = 10
  ): Promise<DisasterAlert[]> => {
    try {
      // Build filter parameters
      const params = {
        appname: APP_NAME,
        limit,
        offset: 0,
        preset: 'latest',
        fields: {
          include: [
            'title',
            'country',
            'primary_country',
            'source',
            'date',
            'disaster_type',
            'body',
            'url_alias'
          ]
        },
        filter: {
          conditions: [
            {
              field: 'theme',
              value: 'Disaster',
              operator: 'OR'
            }
          ]
        }
      };

      // Add country filter if available
      if (userCountry) {
        params.filter.conditions.push({
          field: 'country',
          value: userCountry,
          operator: 'AND'
        });
      }

      const response = await axios.post<ReliefWebResponse>(
        RELIEFWEB_API_URL,
        params,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.data && response.data.data.items) {
        return response.data.data.items.map(report => 
          reliefWebService.convertReportToAlert(report)
        );
      }

      return [];
    } catch (error) {
      console.error('Error fetching ReliefWeb disaster alerts:', error);
      return [];
    }
  },

  // Fetch alerts specifically for Nigeria
  fetchNigeriaAlerts: async (limit: number = 5): Promise<DisasterAlert[]> => {
    return reliefWebService.fetchDisasterAlerts('Nigeria', limit);
  },

  // Check for new disaster alerts since a given timestamp
  checkForNewAlerts: async (
    lastCheckTime: string,
    userCountry?: string
  ): Promise<DisasterAlert[]> => {
    try {
      const params = {
        appname: APP_NAME,
        limit: 10,
        offset: 0,
        fields: {
          include: [
            'title',
            'country',
            'primary_country',
            'source',
            'date',
            'disaster_type',
            'body',
            'url_alias'
          ]
        },
        filter: {
          conditions: [
            {
              field: 'theme',
              value: 'Disaster',
              operator: 'OR'
            },
            {
              field: 'date.created',
              value: {
                from: lastCheckTime
              },
              operator: 'AND'
            }
          ]
        }
      };

      if (userCountry) {
        params.filter.conditions.push({
          field: 'country',
          value: userCountry,
          operator: 'AND'
        });
      }

      const response = await axios.post<ReliefWebResponse>(
        RELIEFWEB_API_URL,
        params,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.data && response.data.data.items) {
        return response.data.data.items.map(report => 
          reliefWebService.convertReportToAlert(report)
        );
      }

      return [];
    } catch (error) {
      console.error('Error checking for new disaster alerts:', error);
      return [];
    }
  }
};

export default reliefWebService;
