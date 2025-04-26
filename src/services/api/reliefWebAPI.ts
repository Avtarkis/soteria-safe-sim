
import axios from 'axios';

const RELIEFWEB_API_URL = 'https://api.reliefweb.int/v1/reports';
const APP_NAME = 'soteria-app';

export interface ReliefWebReport {
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

export interface ReliefWebResponse {
  data: {
    totalCount: number;
    time: number;
    items: ReliefWebReport[];
  };
}

export const reliefWebAPI = {
  fetchReports: async (params: any) => {
    try {
      const response = await axios.post<ReliefWebResponse>(
        RELIEFWEB_API_URL,
        { ...params, appname: APP_NAME },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching from ReliefWeb API:', error);
      throw error;
    }
  }
};
