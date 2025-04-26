
import { DisasterAlert } from '@/types/disasters';
import { reliefWebAPI } from './api/reliefWebAPI';
import { convertReportToAlert } from './transformers/reliefWebTransformer';

export const reliefWebService = {
  fetchDisasterAlerts: async (userCountry?: string, limit: number = 10): Promise<DisasterAlert[]> => {
    try {
      const params = {
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

      if (userCountry) {
        params.filter.conditions.push({
          field: 'country',
          value: userCountry,
          operator: 'AND'
        });
      }

      const response = await reliefWebAPI.fetchReports(params);
      
      if (response?.data?.items) {
        return response.data.items.map(convertReportToAlert);
      }

      return [];
    } catch (error) {
      console.error('Error fetching ReliefWeb disaster alerts:', error);
      return [];
    }
  },

  checkForNewAlerts: async (lastCheckTime: string, userCountry?: string): Promise<DisasterAlert[]> => {
    try {
      const params = {
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

      const response = await reliefWebAPI.fetchReports(params);
      
      if (response?.data?.items) {
        return response.data.items.map(convertReportToAlert);
      }

      return [];
    } catch (error) {
      console.error('Error checking for new disaster alerts:', error);
      return [];
    }
  }
};

export default reliefWebService;
