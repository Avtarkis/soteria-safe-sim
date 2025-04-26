
import { DisasterAlert } from '@/types/disasters';
import { ReliefWebReport } from '../api/reliefWebAPI';
import { mapDisasterType, mapSeverity } from '@/utils/disasterMapping';

export const convertReportToAlert = (report: ReliefWebReport): DisasterAlert => {
  const disasterType = report.fields.disaster_type?.find(dt => dt.primary)?.name || 
                      (report.fields.disaster_type?.[0]?.name || 'Flood');
  
  const mappedType = mapDisasterType(disasterType);
  const mappedSeverity = mapSeverity(
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
    coordinates: [0, 0],
    description: report.fields.body || 'No details available',
    date: report.fields.date.created,
    source: report.fields.source?.[0]?.name || 'ReliefWeb',
    active: true,
    country: report.fields.primary_country?.name || 'Global',
    region: region || 'Unknown',
    url: `https://reliefweb.int/report/${report.fields.url_alias}`
  };
};
