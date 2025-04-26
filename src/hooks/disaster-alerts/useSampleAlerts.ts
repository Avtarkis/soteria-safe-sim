
import { DisasterAlert } from '@/types/disasters';

export const useSampleAlerts = () => {
  const getSampleDisasters = (): DisasterAlert[] => [
    {
      id: '1',
      title: 'Flash Flood Warning',
      type: 'flood',
      severity: 'watch',
      location: 'Downtown Area',
      coordinates: [37.7749, -122.4194],
      description: 'Flash flooding possible in low-lying areas. Where every second counts, move to higher ground immediately.',
      date: new Date().toISOString(),
      source: 'National Weather Service',
      active: true,
      country: 'United States',
      region: 'California',
      url: 'https://example.com/flood-warning'
    },
    {
      id: '2',
      title: 'Wildfire Alert',
      type: 'wildfire',
      severity: 'warning',
      location: 'North County',
      coordinates: [37.8044, -122.2712],
      description: 'Rapidly spreading wildfire. Evacuation orders in effect. Where every second counts, follow evacuation routes.',
      date: new Date().toISOString(),
      source: 'Emergency Management Agency',
      active: true,
      country: 'United States',
      region: 'California',
      url: 'https://example.com/wildfire-alert'
    },
    {
      id: '3',
      title: 'Earthquake Advisory',
      type: 'earthquake',
      severity: 'advisory',
      location: 'Regional',
      coordinates: [37.7858, -122.4064],
      description: 'Minor seismic activity detected. No immediate danger, but remain alert. Every second counts when preparing.',
      date: new Date(Date.now() - 86400000).toISOString(),
      source: 'Geological Survey',
      active: false,
      country: 'United States',
      region: 'California',
      url: 'https://example.com/earthquake-advisory'
    }
  ];

  return { getSampleDisasters };
};
