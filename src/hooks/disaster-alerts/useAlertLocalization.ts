
import { DisasterAlert } from '@/types/disasters';

export const useAlertLocalization = () => {
  const localizeAlerts = (alerts: DisasterAlert[], userLocation: [number, number] | null): DisasterAlert[] => {
    if (!userLocation) return alerts;
    
    const [lat, lng] = userLocation;
    const localizedAlerts = [...alerts];
    
    if (lat > 40 && lat < 50 && lng > -80 && lng < -70) {
      localizedAlerts.forEach(alert => {
        alert.country = 'United States';
        alert.region = 'New York';
        alert.location = 'Northeast Region';
      });
    } else if (lat > 30 && lat < 40 && lng > -100 && lng < -90) {
      localizedAlerts.forEach(alert => {
        alert.country = 'United States';
        alert.region = 'Texas';
        alert.location = 'Southern Region';
      });
    }
    
    return localizedAlerts;
  };

  return { localizeAlerts };
};
