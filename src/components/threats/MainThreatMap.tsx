
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/CardWrapper';
import { MapIcon } from 'lucide-react';
import LeafletMap from '@/components/ui/LeafletMap';
import { ThreatMarker } from '@/types/threats';
import MapActionButtons from './MapActionButtons';
import LegendCard from './LegendCard';
import MapFilterButtons from './MapFilterButtons';
import ThreatDetails from './ThreatDetails';

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
        <div className="h-full w-full flex items-center justify-center bg-muted/20">
          <div className="flex flex-col items-center">
            <MapIcon className="h-10 w-10 text-muted-foreground animate-pulse" />
            <p className="mt-2 text-muted-foreground">Loading threat map...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="h-full w-full relative">
            <LeafletMap 
              markers={filteredMarkers}
              onMarkerClick={handleThreatClick}
              center={userLocation || [37.0902, -95.7129]}
              zoom={userLocation ? 12 : 4}
              showUserLocation={showUserLocation}
              ref={mapRef}
            />
          </div>

          <ThreatDetails 
            selectedThreat={selectedThreat}
            clearSelectedThreat={clearSelectedThreat}
          />
        </>
      )}
    </Card>
  );
};

export default MainThreatMap;
