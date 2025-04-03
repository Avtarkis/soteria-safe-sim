
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/CardWrapper';
import { MapIcon } from 'lucide-react';
import LeafletMap from '@/components/ui/LeafletMap';
import { ThreatMarker } from '@/types/threats';
import MapActionButtons from './MapActionButtons';
import LegendCard from './LegendCard';
import MapFilterButtons from './MapFilterButtons';
import ThreatDetails from './ThreatDetails';
import MapLoadingState from './MapLoadingState';
import MapContainer from './MapContainer';

interface FilterOption {
  id: string;
  label: string;
  active: boolean;
  color: string;
}

interface MainThreatMapProps {
  loading: boolean;
  showLegend: boolean;
  showUserLocation: boolean;
  filters: FilterOption[];
  userLocation: [number, number] | null;
  mapRef: React.RefObject<L.Map>;
  selectedThreat: any;
  refreshing: boolean;
  filteredMarkers: ThreatMarker[];
  toggleUserLocation: () => void;
  setShowLegend: (show: boolean) => void;
  handleRefresh: () => void;
  toggleFilter: (id: string) => void;
  handleThreatClick: (threat: ThreatMarker) => void;
  clearSelectedThreat: () => void;
}

const MainThreatMap = ({
  loading,
  showLegend,
  showUserLocation,
  filters,
  userLocation,
  mapRef,
  selectedThreat,
  refreshing,
  filteredMarkers,
  toggleUserLocation,
  setShowLegend,
  handleRefresh,
  toggleFilter,
  handleThreatClick,
  clearSelectedThreat
}: MainThreatMapProps) => {
  // This will help ensure the map is properly sized when loaded
  useEffect(() => {
    if (mapRef.current && !loading) {
      // Trigger a resize event after the map is loaded to ensure proper sizing
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [loading, mapRef]);
  
  return (
    <Card className="overflow-hidden h-[70vh]">
      <MapActionButtons 
        showUserLocation={showUserLocation}
        toggleUserLocation={toggleUserLocation}
        showLegend={showLegend}
        setShowLegend={setShowLegend}
        handleRefresh={handleRefresh}
        refreshing={refreshing}
        userLocation={userLocation}
      />

      <LegendCard showLegend={showLegend} />

      <MapFilterButtons 
        filters={filters}
        toggleFilter={toggleFilter}
      />

      {loading ? (
        <MapLoadingState />
      ) : (
        <MapContainer 
          mapRef={mapRef}
          filteredMarkers={filteredMarkers}
          handleThreatClick={handleThreatClick}
          userLocation={userLocation}
          showUserLocation={showUserLocation}
          selectedThreat={selectedThreat}
          clearSelectedThreat={clearSelectedThreat}
        />
      )}
    </Card>
  );
};

export default MainThreatMap;
