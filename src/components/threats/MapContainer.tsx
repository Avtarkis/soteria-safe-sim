
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  // Create a stable key to prevent unnecessary re-creation
  const mapContainerKey = useRef(`map-container-${Date.now()}`).current;
  
  // Memoize the threat markers to prevent unnecessary re-renders
  const memoizedMarkers = useRef<ThreatMarker[]>([]);
  const markersJSON = JSON.stringify(filteredMarkers.map(m => 
    `${m.id}-${m.position[0]}-${m.position[1]}-${m.level}`
  ));
  
  // Only update markers reference if they've changed
  useEffect(() => {
    const parsedMarkers = JSON.parse(markersJSON);
    if (JSON.stringify(memoizedMarkers.current) !== markersJSON) {
      memoizedMarkers.current = filteredMarkers;
    }
  }, [markersJSON, filteredMarkers]);
  
  // Memoize the center location to prevent unnecessary map movements
  const center = userLocation || [37.0902, -95.7129];
  const zoom = userLocation ? 12 : 4;
  
  // Handle resize once after initial render
  const hasResized = useRef(false);
  useEffect(() => {
    if (mapRef.current && !hasResized.current) {
      // Set flag to prevent multiple resize attempts
      hasResized.current = true;
      
      // Short delay to let the component fully render
      const timer = setTimeout(() => {
        try {
          if (mapRef.current) {
            mapRef.current.invalidateSize(false);
            console.log("Map container: invalidated size");
          }
        } catch (error) {
          console.error("Error during map resize:", error);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [mapRef]);

  return (
    <div className="relative h-full w-full" key={mapContainerKey}>
      <div 
        className="h-full w-full relative" 
        style={{ minHeight: '380px' }}
      >
        <LeafletMap 
          markers={memoizedMarkers.current}
          onMarkerClick={handleThreatClick}
          center={center}
          zoom={zoom}
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
    </div>
  );
};

export default React.memo(MapContainer);
