
import React from 'react';
import LeafletMap from '@/components/ui/LeafletMap';
import { ThreatMarker } from '@/types/threats';

interface MapContentProps {
  mapRef: React.RefObject<L.Map>;
  filteredMarkers: ThreatMarker[];
  handleThreatClick: (threat: ThreatMarker) => void;
  userLocation: [number, number] | null;
  showUserLocation: boolean;
}

/**
 * Core map component that renders the Leaflet map
 */
const MapContent = ({
  mapRef,
  filteredMarkers,
  handleThreatClick,
  userLocation,
  showUserLocation
}: MapContentProps) => {
  // Default center location with fallback
  const defaultCenter: [number, number] = [9.0820, 8.6753]; // Nigeria center coordinates
  const center = userLocation && 
                userLocation[0] && 
                userLocation[1] && 
                !isNaN(userLocation[0]) && 
                !isNaN(userLocation[1]) 
                  ? userLocation 
                  : defaultCenter;
  
  const zoom = userLocation ? 12 : 4;

  return (
    <div 
      className="h-full w-full relative" 
      style={{ 
        minHeight: '500px',
        display: 'block'
      }}
    >
      <LeafletMap 
        markers={filteredMarkers}
        onMarkerClick={handleThreatClick}
        center={center}
        zoom={zoom}
        showUserLocation={showUserLocation}
        ref={mapRef}
      />
    </div>
  );
};

export default MapContent;
