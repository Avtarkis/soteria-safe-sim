
import React, { useEffect, useRef, useState } from 'react';
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
  const mapContainerKey = useRef(`map-container-${Date.now()}`);
  const [mapReady, setMapReady] = useState(false);
  const lastResizeTimeRef = useRef<number>(0);
  const minResizeIntervalRef = useRef<number>(5000); // 5 seconds between resizes
  
  // Enhanced map sizing effect with debounce
  useEffect(() => {
    // Safe resize function with throttling
    const resizeMap = () => {
      const now = Date.now();
      // Prevent too many resize operations
      if (now - lastResizeTimeRef.current < minResizeIntervalRef.current) {
        return;
      }
      
      if (mapRef.current && mapRef.current.getContainer && mapRef.current.getContainer().clientHeight > 0) {
        try {
          console.log('Resizing map to ensure proper display');
          window.dispatchEvent(new Event('resize'));
          mapRef.current.invalidateSize(true);
          lastResizeTimeRef.current = now;
          
          // If map is ready, mark as initialized
          if (!mapInitializedRef.current && mapReady) {
            mapInitializedRef.current = true;
          }
        } catch (error) {
          console.error("Error resizing map:", error);
        }
      }
    };
    
    // Apply resize on component mount with a delay to ensure DOM is ready
    const initialResizeTimer = setTimeout(() => {
      resizeMap();
      setMapReady(true);
      
      // Schedule only one additional resize attempt for reliability
      setTimeout(resizeMap, 1000);
    }, 500);
    
    // Debounced window resize handler
    const handleWindowResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(resizeMap, 300);
    };
    
    // Add throttled resize handler for window resize
    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      clearTimeout(initialResizeTimer);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [mapRef, mapReady]);

  // Optimized high precision mode handler with reduced frequency
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      if (highPrecisionAttemptedRef.current) return; // Skip if already attempted
      
      console.log("High precision mode activated in map container");
      highPrecisionAttemptedRef.current = true;
      
      // Force map update and resize safely - only once
      if (mapRef.current && mapRef.current.getContainer && mapRef.current.getContainer().clientHeight > 0) {
        // Clear any existing timeout
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        
        // Schedule a single resize attempt
        resizeTimeoutRef.current = setTimeout(() => {
          try {
            if (mapRef.current && mapRef.current.getContainer && mapRef.current.getContainer().clientHeight > 0) {
              console.log("Refreshing map for high precision mode");
              window.dispatchEvent(new Event('resize'));
              mapRef.current.invalidateSize(true);
            }
          } catch (error) {
            console.error("Error refreshing map in high precision mode:", error);
          }
        }, 500);
      }
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    // Optimized location update handler - don't update the map on every location change
    const locationUpdateTimeRef = useRef<number>(0);
    const locationUpdateIntervalRef = useRef<number>(5000); // 5 seconds between updates
    
    const handleUserLocationUpdate = () => {
      const now = Date.now();
      if (now - locationUpdateTimeRef.current < locationUpdateIntervalRef.current) {
        return; // Skip if updated recently
      }
      
      if (mapRef.current && mapInitializedRef.current && showUserLocation && 
          mapRef.current.getContainer && mapRef.current.getContainer().clientHeight > 0) {
        try {
          console.log("Refreshing map for location update");
          mapRef.current.invalidateSize(true);
          locationUpdateTimeRef.current = now;
        } catch (error) {
          console.error("Error refreshing map for location update:", error);
        }
      }
    };
    
    document.addEventListener('userLocationUpdated', handleUserLocationUpdate);
    
    // Try to activate high precision mode automatically but only once
    if (!highPrecisionAttemptedRef.current && mapReady) {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
      }, 2000);
    }
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
      document.removeEventListener('userLocationUpdated', handleUserLocationUpdate);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [mapRef, showUserLocation, mapReady, toast]);

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
