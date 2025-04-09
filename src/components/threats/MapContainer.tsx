
import React, { useEffect, useState } from 'react';
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
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapContainerKey] = useState(`map-container-${Date.now()}`);
  const [lastResizeTime, setLastResizeTime] = useState<number>(0);
  const [highPrecisionAttempted, setHighPrecisionAttempted] = useState(false);
  const minResizeInterval = 10000; // Increased to 10 seconds between resizes to reduce flickering
  
  // Simplified map sizing effect with reduced frequency
  useEffect(() => {
    const handleMapInitialization = () => {
      if (mapRef.current && !isMapReady) {
        // Only resize once on initialization
        try {
          console.log('Initial map sizing');
          window.dispatchEvent(new Event('resize'));
          mapRef.current.invalidateSize(true);
          setIsMapReady(true);
        } catch (error) {
          console.error("Error during initial map resize:", error);
        }
      }
    };
    
    // Apply initial resize after a short delay
    const initialResizeTimer = setTimeout(handleMapInitialization, 500);
    
    return () => {
      clearTimeout(initialResizeTimer);
    };
  }, [mapRef, isMapReady]);

  // Add a separate effect for window resize with heavy throttling
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout | null = null;
    
    const handleWindowResize = () => {
      // Clear any existing timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      const now = Date.now();
      // Prevent too many resize operations
      if (now - lastResizeTime < minResizeInterval) {
        // Schedule a single resize later
        resizeTimeout = setTimeout(() => {
          if (mapRef.current) {
            try {
              console.log('Delayed resize after window change');
              mapRef.current.invalidateSize(false); // Use false for smoother resize
              setLastResizeTime(Date.now());
            } catch (error) {
              console.error("Error during delayed resize:", error);
            }
          }
        }, minResizeInterval - (now - lastResizeTime));
        return;
      }
      
      // Schedule a resize with a long debounce
      resizeTimeout = setTimeout(() => {
        if (mapRef.current) {
          try {
            console.log('Resizing map after window resize');
            mapRef.current.invalidateSize(false);
            setLastResizeTime(Date.now());
          } catch (error) {
            console.error("Error resizing map:", error);
          }
        }
      }, 500); // Long debounce for reduced flickering
    };
    
    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [mapRef, lastResizeTime, minResizeInterval]);

  // Simplified high precision mode handler with reduced frequency
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      if (highPrecisionAttempted) return; // Skip if already attempted
      
      console.log("High precision mode activated in map container");
      setHighPrecisionAttempted(true);
      
      // Schedule a single resize attempt with delay
      setTimeout(() => {
        if (mapRef.current && mapRef.current.getContainer().clientHeight > 0) {
          try {
            console.log("Refreshing map for high precision mode");
            mapRef.current.invalidateSize(false);
          } catch (error) {
            console.error("Error refreshing map in high precision mode:", error);
          }
        }
      }, 1000);
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    };
  }, [mapRef, highPrecisionAttempted]);

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
