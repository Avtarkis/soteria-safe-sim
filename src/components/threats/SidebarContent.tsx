
import React from 'react';
import CurrentLocationCard from '@/components/threats/CurrentLocationCard';
import RiskAssessmentCard from '@/components/threats/RiskAssessmentCard';
import EmergencyNumbersCard from '@/components/threats/EmergencyNumbersCard';
import NearbyAlertsCard from '@/components/threats/NearbyAlertsCard';
import DisasterAlertsCard from '@/components/threats/DisasterAlertsCard';
import TravelAdvisoryCard from '@/components/threats/TravelAdvisoryCard';
import WeatherForecastCard from '@/components/threats/WeatherForecastCard';
import SafeRoutesDisplay from '@/components/threats/SafeRoutesDisplay';
import { ThreatMarker } from '@/types/threats';
import { DisasterAlert } from '@/types/disasters';
import { EmergencyService } from '@/types/disasters';
import { useToast } from '@/hooks/use-toast';

interface SidebarContentProps {
  userLocation: [number, number] | null;
  locationAccuracy: number | null;
  showUserLocation: boolean;
  toggleUserLocation: () => void;
  loading: boolean;
  threatMarkers: ThreatMarker[];
  disasterAlerts: DisasterAlert[];
  weatherAlerts: DisasterAlert[];
  emergencyNumbers: EmergencyService[];
  countryCode: string | null;
  getNearbyAlerts: () => ThreatMarker[];
  checkForNewDisasterAlerts: () => Promise<boolean>;
  destination?: [number, number];
}

const SidebarContent = ({
  userLocation,
  locationAccuracy,
  showUserLocation,
  toggleUserLocation,
  loading,
  threatMarkers,
  disasterAlerts,
  weatherAlerts,
  emergencyNumbers,
  countryCode,
  getNearbyAlerts,
  checkForNewDisasterAlerts,
  destination
}: SidebarContentProps) => {
  const { toast } = useToast();
  
  // Combine disaster alerts and weather alerts
  const combinedAlerts = [...disasterAlerts, ...weatherAlerts];
  
  // Handler for refreshing disaster alerts
  const handleRefreshDisasterAlerts = async () => {
    const hasNewAlerts = await checkForNewDisasterAlerts();
    
    toast({
      title: "Checking for Disaster Alerts",
      description: `Fetching the latest NASA EONET and weather information...${hasNewAlerts ? ' New alerts found!' : ''}`,
    });
  };

  return (
    <div className="space-y-4">
      <CurrentLocationCard
        userLocation={userLocation}
        locationAccuracy={locationAccuracy}
        showUserLocation={showUserLocation}
        toggleUserLocation={toggleUserLocation}
      />
      
      <RiskAssessmentCard />
      
      <SafeRoutesDisplay
        userLocation={userLocation}
        disasters={combinedAlerts}
        destination={destination}
      />
      
      <WeatherForecastCard
        userLocation={userLocation}
        countryCode={countryCode || undefined}
      />
      
      <EmergencyNumbersCard
        emergencyNumbers={emergencyNumbers}
        userLocation={userLocation}
        countryCode={countryCode}
      />
      
      <NearbyAlertsCard
        loading={loading}
        getNearbyAlerts={getNearbyAlerts}
      />

      <DisasterAlertsCard
        disasterAlerts={combinedAlerts}
        onRefresh={handleRefreshDisasterAlerts}
      />

      <TravelAdvisoryCard 
        userLocation={userLocation}
        countryCode={countryCode}
      />
    </div>
  );
};

export default SidebarContent;
