
import React, { useEffect, useState, useRef } from 'react';
import LeafletMap from '@/components/ui/LeafletMap';
import ThreatDetails from './ThreatDetails';
import { ThreatMarker } from '@/types/threats';
import { useToast } from '@/hooks/use-toast';

interface MapContainerProps {
  mapRef: React.RefObject<L.Map>;
  filteredMarkers: ThreatMarker[];
  handleThreatClick: (threat: ThreatMarker) => void;
  userLocation: [number, number] | null;
  showUserLocation: boolean;
  selectedThreat: any;
  clearSelectedThreat: () => void;
}

const MapContainer = ({
  mapRef,
  filteredMarkers,
  handleThreatClick,
  userLocation,
  showUserLocation,
  selectedThreat,
  clearSelectedThreat
}: MapContainerProps) => {
  const { toast } = useToast();
  const isInitialRenderRef = useRef(true);
  const [mapContainerKey] = useState(`map-container-${Date.now()}`);
  
  // Simplified initialization that doesn't cause re-renders
  useEffect(() => {
    if (isInitialRenderRef.current && mapRef.current) {
      try {
        console.log('Initial map sizing once');
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize({ animate: false });
          }
          isInitialRenderRef.current = false;
        }, 500);
      } catch (error) {
        console.error("Error during initial map resize:", error);
      }
    }
  }, [mapRef]);

  return (
    <>
      <div 
        className="h-full w-full relative" 
        style={{ minHeight: '300px' }}
        key={mapContainerKey}
      >
        <LeafletMap 
          markers={filteredMarkers}
          onMarkerClick={handleThreatClick}
          center={userLocation || [37.0902, -95.7129]}
          zoom={userLocation ? 12 : 4}
          showUserLocation={showUserLocation}
          ref={mapRef}
        />
      </div>

      {selectedThreat && (
        <ThreatDetails 
          selectedThreat={selectedThreat}
          clearSelectedThreat={clearSelectedThreat}
        />
      )}
    </>
  );
};

export default MapContainer;
