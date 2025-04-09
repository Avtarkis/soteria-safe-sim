
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
  // Use a static key to prevent re-creation of the container
  const mapContainerKey = useRef(`map-${Date.now()}`).current;
  const resizeAttemptedRef = useRef(false);
  
  // Minimal one-time resize with no re-renders or timers
  useEffect(() => {
    if (mapRef.current && !resizeAttemptedRef.current) {
      // Mark that we've attempted resize to prevent future attempts
      resizeAttemptedRef.current = true;
      // Simple invalidation without animation or delays
      mapRef.current.invalidateSize({ animate: false });
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
