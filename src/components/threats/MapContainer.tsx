
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
  const [mapKey] = useState(`map-container-${Date.now()}`);
  const skipResizeRef = useRef(false);
  
  // Prevent multiple resize operations
  useEffect(() => {
    if (mapRef.current && !skipResizeRef.current) {
      // Set a flag to prevent multiple resizes
      skipResizeRef.current = true;
      
      // Simple one-time initialization, without any timers
      if (mapRef.current) {
        mapRef.current.invalidateSize({ animate: false });
      }
    }
    
    // Cleanup function
    return () => {
      skipResizeRef.current = false;
    };
  }, [mapRef]);

  return (
    <>
      <div 
        className="h-full w-full relative" 
        style={{ minHeight: '300px' }}
        key={mapKey}
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
