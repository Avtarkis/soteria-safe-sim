
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
  const highPrecisionAttemptedRef = useRef(false);
  
  // Enhanced map sizing effect
  useEffect(() => {
    const resizeMap = () => {
      if (mapRef.current) {
        console.log('Resizing map to ensure proper display');
        window.dispatchEvent(new Event('resize'));
        mapRef.current.invalidateSize(true);
      }
    };
    
    // Apply resize on component mount
    resizeMap();
    
    // Also apply resize when window gets resized
    window.addEventListener('resize', resizeMap);
    
    // And schedule multiple resize attempts for reliability
    const timeoutId = setTimeout(() => {
      resizeMap();
      mapInitializedRef.current = true;
      
      // Make additional resize attempts
      setTimeout(resizeMap, 300);
      setTimeout(resizeMap, 1000);
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
      highPrecisionAttemptedRef.current = true;
      
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
            
            // Force a second update for reliability
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
    
    // Try to activate high precision mode automatically when component mounts
    if (!highPrecisionAttemptedRef.current) {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
      }, 1500);
    }
    
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
          showUserLocation={showUserLocation || true} // Always show user location for better UX
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
