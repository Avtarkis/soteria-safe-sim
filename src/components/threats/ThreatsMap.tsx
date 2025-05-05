
import React, { useEffect, useState, useCallback, useMemo } from 'react';

// Import custom hooks
import useUserLocation from '@/hooks/useUserLocation';
import useThreatData from '@/hooks/useThreatData';
import useMapState from '@/hooks/useMapState';
import useDestination from '@/hooks/useDestination';

// Import components
import ThreatsMapHeader from '@/components/threats/ThreatsMapHeader';
import MainThreatMap from '@/components/threats/MainThreatMap';
import CurrentLocationCard from '@/components/threats/CurrentLocationCard';
import RiskAssessmentCard from '@/components/threats/RiskAssessmentCard';
import EmergencyNumbersCard from '@/components/threats/EmergencyNumbersCard';
import NearbyAlertsCard from '@/components/threats/NearbyAlertsCard';
import DisasterAlertsCard from '@/components/threats/DisasterAlertsCard';
import TravelAdvisoryCard from '@/components/threats/TravelAdvisoryCard';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { DetectionAlert } from '@/types/detection';

const ThreatsMap = () => {
  const { toast } = useToast();
  // Get user location
  const { userLocation, locationAccuracy, setUserLocation, setLocationAccuracy } = useUserLocation();
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  
  // Get threat data with memoization to prevent unnecessary rerenders
  const { 
    loading, 
    refreshing, 
    threatMarkers, 
    disasterAlerts, 
    emergencyNumbers,
    countryCode,
    handleRefresh,
    checkForNewDisasterAlerts
  } = useThreatData(userLocation);
  
  // Get map state - initialize with legend showing
  const {
    selectedThreat,
    showLegend,
    showUserLocation,
    filters,
    mapRef,
    toggleUserLocation,
    toggleFilter,
    handleThreatClick,
    clearSelectedThreat,
    getFilteredMarkers,
    getNearbyAlerts,
    setShowLegend
  } = useMapState();
  
  // Get destination
  const { destination } = useDestination();
  
  // Ensure legend is visible by default
  useEffect(() => {
    // Make sure legend is always showing by default
    if (!showLegend) {
      setShowLegend(true);
    }
  }, [showLegend, setShowLegend]);
  
  // High precision mode handler
  const activateHighPrecisionMode = useCallback(() => {
    // Dispatch high precision activation event
    document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
    
    toast({
      title: "High Precision Mode",
      description: "Activating enhanced location precision... every second counts.",
    });
    
    // If location tracking is not on, turn it on
    if (!showUserLocation) {
      toggleUserLocation();
    }
  }, [showUserLocation, toggleUserLocation, toast]);
  
  // Memoize the filtered markers to prevent unnecessary recalculations
  const filteredMarkers = useMemo(() => 
    getFilteredMarkers(threatMarkers), 
    [threatMarkers, getFilteredMarkers, filters]
  );
  
  // Only initialize map once
  useEffect(() => {
    if (!loading && !isMapInitialized) {
      setIsMapInitialized(true);
    }
  }, [loading, isMapInitialized]);

  // Update destination object for proper formatting
  const formattedDestination = useMemo(() => {
    if (!destination) {
      return { name: 'Current Location', coordinates: [0, 0] as [number, number] };
    }
    if (typeof destination === 'string') {
      return {
        name: destination,
        coordinates: [0, 0] as [number, number] // Default coordinates if string
      };
    }
    return destination;
  }, [destination]);

  // Handler for refreshing disaster alerts
  const handleRefreshDisasterAlerts = useCallback(() => {
    checkForNewDisasterAlerts?.();
    toast({
      title: "Checking for Disaster Alerts",
      description: "Fetching the latest humanitarian crisis information...",
    });
  }, [checkForNewDisasterAlerts, toast]);
  
  // Demo function to simulate weapon detection events
  const simulateWeaponDetection = useCallback(() => {
    if (!userLocation) return;
    
    // Create a simulated detection alert
    const detectionAlert: DetectionAlert = {
      id: uuidv4(),
      title: 'Potential Weapon Detected',
      description: 'A suspicious object resembling a gun has been detected nearby.',
      level: Math.random() > 0.7 ? 3 : Math.random() > 0.5 ? 2 : 1,
      timestamp: new Date().toISOString(),
      location: [
        userLocation[0] + (Math.random() * 0.002 - 0.001), 
        userLocation[1] + (Math.random() * 0.002 - 0.001)
      ],
      weaponType: Math.random() > 0.7 ? 'gun' : 'knife',
      confidence: 0.75 + Math.random() * 0.2,
      verified: Math.random() > 0.3
    };
    
    // Dispatch the detection event
    const event = new CustomEvent('weaponDetected', { detail: detectionAlert });
    document.dispatchEvent(event);
  }, [userLocation]);
  
  // For demo purposes only - remove in production
  useEffect(() => {
    const demoButton = document.createElement('button');
    demoButton.textContent = 'Simulate Detection';
    demoButton.className = 'fixed bottom-4 right-4 z-50 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg';
    demoButton.addEventListener('click', simulateWeaponDetection);
    document.body.appendChild(demoButton);
    
    return () => {
      document.body.removeChild(demoButton);
    };
  }, [simulateWeaponDetection]);

  return (
    <div className="container pb-10 animate-fade-in">
      <ThreatsMapHeader destination={formattedDestination} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 relative">
          {isMapInitialized && (
            <MainThreatMap
              loading={loading}
              showLegend={showLegend}
              showUserLocation={showUserLocation}
              filters={filters}
              userLocation={userLocation}
              mapRef={mapRef}
              selectedThreat={selectedThreat}
              refreshing={refreshing}
              filteredMarkers={filteredMarkers}
              toggleUserLocation={toggleUserLocation}
              setShowLegend={setShowLegend}
              handleRefresh={handleRefresh}
              toggleFilter={toggleFilter}
              handleThreatClick={handleThreatClick}
              clearSelectedThreat={clearSelectedThreat}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-4">
            <CurrentLocationCard
              userLocation={userLocation}
              locationAccuracy={locationAccuracy}
              showUserLocation={showUserLocation}
              toggleUserLocation={toggleUserLocation}
            />
            
            <RiskAssessmentCard />
            
            <EmergencyNumbersCard
              emergencyNumbers={emergencyNumbers}
              userLocation={userLocation}
              countryCode={countryCode}
            />
            
            <NearbyAlertsCard
              loading={loading}
              getNearbyAlerts={() => getNearbyAlerts(threatMarkers)}
            />

            <DisasterAlertsCard
              disasterAlerts={disasterAlerts}
              onRefresh={handleRefreshDisasterAlerts}
            />

            <TravelAdvisoryCard 
              userLocation={userLocation}
              countryCode={countryCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatsMap;
