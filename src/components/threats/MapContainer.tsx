
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
  const mapContainerKey = useRef(`map-container-${Date.now()}`); // Unique key to help with re-rendering
  
  // Enhanced map sizing effect
  useEffect(() => {
    // Safe resize function
    const resizeMap = () => {
      if (mapRef.current && mapRef.current.getContainer && mapRef.current.getContainer().clientHeight > 0) {
        try {
          console.log('Resizing map to ensure proper display');
          window.dispatchEvent(new Event('resize'));
          mapRef.current.invalidateSize(true);
        } catch (error) {
          console.error("Error resizing map:", error);
        }
      }
    };
    
    // Apply resize on component mount with a delay to ensure DOM is ready
    const initialResizeTimer = setTimeout(() => {
      resizeMap();
      mapInitializedRef.current = true;
      
      // Schedule additional resize attempts for reliability
      setTimeout(resizeMap, 300);
      setTimeout(resizeMap, 1000);
    }, 500);
    
    // Also apply resize when window gets resized
    window.addEventListener('resize', resizeMap);
    
    return () => {
      window.removeEventListener('resize', resizeMap);
      clearTimeout(initialResizeTimer);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [mapRef]);

  // Listen for high precision mode activation to update map
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      console.log("High precision mode activated in map container");
      highPrecisionAttemptedRef.current = true;
      
      // Force map update and resize safely
      if (mapRef.current && mapRef.current.getContainer && mapRef.current.getContainer().clientHeight > 0) {
        // Clear any existing timeout
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        
        // Schedule multiple resize attempts to ensure map updates fully
        resizeTimeoutRef.current = setTimeout(() => {
          try {
            if (mapRef.current && mapRef.current.getContainer && mapRef.current.getContainer().clientHeight > 0) {
              console.log("Refreshing map for high precision mode");
              window.dispatchEvent(new Event('resize'));
              mapRef.current.invalidateSize(true);
              
              // Force a second update for reliability
              setTimeout(() => {
                if (mapRef.current && mapRef.current.getContainer && mapRef.current.getContainer().clientHeight > 0) {
                  mapRef.current.invalidateSize(true);
                }
              }, 300);
            }
          } catch (error) {
            console.error("Error refreshing map in high precision mode:", error);
          }
        }, 200);
      }
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    // Also listen for user location updates to refresh map
    const handleUserLocationUpdate = () => {
      if (mapRef.current && mapInitializedRef.current && showUserLocation && 
          mapRef.current.getContainer && mapRef.current.getContainer().clientHeight > 0) {
        try {
          console.log("Refreshing map for location update");
          mapRef.current.invalidateSize(true);
        } catch (error) {
          console.error("Error refreshing map for location update:", error);
        }
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
      <div 
        className="h-full w-full relative" 
        style={{ minHeight: '300px' }}
        key={mapContainerKey.current}
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

      <ThreatDetails 
        selectedThreat={selectedThreat}
        clearSelectedThreat={clearSelectedThreat}
      />
    </>
  );
};

export default MapContainer;
