
import React, { useEffect } from 'react';
import LeafletMap from '@/components/ui/LeafletMap';
import ThreatDetails from './ThreatDetails';
import { ThreatMarker } from '@/types/threats';

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
  // This effect will help ensure the map is properly resized
  useEffect(() => {
    const resizeMap = () => {
      if (mapRef.current) {
        console.log('Resizing map to ensure display');
        window.dispatchEvent(new Event('resize'));
        mapRef.current.invalidateSize(true);
      }
    };
    
    // Apply resize on component mount
    resizeMap();
    
    // Also apply resize when window gets resized
    window.addEventListener('resize', resizeMap);
    
    // And once more after a short delay to handle any delayed rendering
    const timeoutId = setTimeout(resizeMap, 500);
    
    return () => {
      window.removeEventListener('resize', resizeMap);
      clearTimeout(timeoutId);
    };
  }, [mapRef]);

  return (
    <>
      <div className="h-full w-full relative" style={{ minHeight: '300px' }}>
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
  );
};

export default MapContainer;
