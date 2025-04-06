
import React, { useEffect, useRef } from 'react';
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
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapInitializedRef = useRef(false);
  
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
    const timeoutId = setTimeout(() => {
      resizeMap();
      mapInitializedRef.current = true;
    }, 500);
    
    return () => {
      window.removeEventListener('resize', resizeMap);
      clearTimeout(timeoutId);
    };
  }, [mapRef]);

  // Listen for high precision mode activation to update map
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      console.log("High precision mode activated in map container");
      // Force map update and resize
      if (mapRef.current) {
        // Clear any existing timeout
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        
        // Schedule multiple resize attempts to ensure map updates fully
        resizeTimeoutRef.current = setTimeout(() => {
          if (mapRef.current) {
            console.log("Refreshing map for high precision mode");
            window.dispatchEvent(new Event('resize'));
            mapRef.current.invalidateSize(true);
            
            // Notify user that high precision is active
            toast({
              title: "High-Precision Tracking Active",
              description: "Map updated with street-level details and precise location.",
            });
            
            // Make another attempt after a delay for reliability
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.invalidateSize(true);
              }
            }, 300);
          }
        }, 200);
      }
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    // Also listen for user location updates to refresh map
    const handleUserLocationUpdate = () => {
      if (mapRef.current && mapInitializedRef.current && showUserLocation) {
        console.log("Refreshing map for location update");
        mapRef.current.invalidateSize(true);
      }
    };
    
    document.addEventListener('userLocationUpdated', handleUserLocationUpdate);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
      document.removeEventListener('userLocationUpdated', handleUserLocationUpdate);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [mapRef, showUserLocation, toast]);

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
