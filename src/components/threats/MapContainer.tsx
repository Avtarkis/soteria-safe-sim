
import React, { useEffect, useState, useRef, useCallback } from 'react';
import LeafletMap from '@/components/ui/LeafletMap';
import ThreatDetails from './ThreatDetails';
import MapDetectionOverlay from './MapDetectionOverlay';
import { ThreatMarker } from '@/types/threats';
import { DetectionAlert } from '@/types/detection';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for detection alerts
  const [activeDetectionAlert, setActiveDetectionAlert] = useState<DetectionAlert | null>(null);
  
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
  // Ensure we always have valid fallback coordinates
  const defaultCenter: [number, number] = [37.0902, -95.7129]; // USA center
  const center = userLocation && 
                userLocation[0] && 
                userLocation[1] && 
                !isNaN(userLocation[0]) && 
                !isNaN(userLocation[1]) 
                  ? userLocation 
                  : defaultCenter;
  
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
            mapRef.current.invalidateSize(true);
            console.log("Map container: invalidated size");
          }
        } catch (error) {
          console.error("Error during map resize:", error);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [mapRef]);

  // Listen for weapon detection events
  useEffect(() => {
    const handleDetectionEvent = (e: CustomEvent) => {
      const alert: DetectionAlert = e.detail;
      
      if (alert) {
        console.log('Weapon detection alert received:', alert);
        setActiveDetectionAlert(alert);
      }
    };

    // Add event listener for weapon detection
    document.addEventListener('weaponDetected', handleDetectionEvent as EventListener);
    
    return () => {
      document.removeEventListener('weaponDetected', handleDetectionEvent as EventListener);
    };
  }, []);

  // Handle closing the detection alert
  const handleCloseDetectionAlert = useCallback(() => {
    setActiveDetectionAlert(null);
  }, []);

  // Handle viewing the alert on the map
  const handleViewAlertOnMap = useCallback(() => {
    if (activeDetectionAlert && activeDetectionAlert.location && mapRef.current) {
      mapRef.current.setView(activeDetectionAlert.location, 18);
      handleCloseDetectionAlert();
    }
  }, [activeDetectionAlert, mapRef, handleCloseDetectionAlert]);

  // Effect to ensure the map takes up full viewport height on mobile
  useEffect(() => {
    const adjustHeight = () => {
      if (containerRef.current && isMobile) {
        const viewportHeight = window.innerHeight;
        const position = containerRef.current.getBoundingClientRect();
        const topOffset = position.top;
        const availableHeight = viewportHeight - topOffset - 120; // Leave space for buttons at bottom
        
        containerRef.current.style.height = `${Math.max(500, availableHeight)}px`;
        
        // Force map resize
        if (mapRef.current) {
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize(true);
            }
          }, 100);
        }
      }
    };
    
    // Run once on mount and when isMobile changes
    adjustHeight();
    
    // Also run when window resizes
    window.addEventListener('resize', adjustHeight);
    
    return () => {
      window.removeEventListener('resize', adjustHeight);
    };
  }, [isMobile, mapRef]);

  return (
    <div 
      className={cn(
        "relative w-full", 
        isMobile ? "h-[70vh]" : "h-[600px]"
      )} 
      key={mapContainerKey}
      ref={containerRef}
      style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        overflow: 'hidden',
        minHeight: '500px',
        display: 'block' // Ensure the container is visible
      }}
    >
      <div 
        className="h-full w-full relative" 
        style={{ 
          minHeight: isMobile ? '500px' : '600px',
          display: 'block' // Ensure the container is visible
        }}
      >
        <LeafletMap 
          markers={memoizedMarkers.current}
          onMarkerClick={handleThreatClick}
          center={center}
          zoom={zoom}
          showUserLocation={showUserLocation}
          ref={mapRef}
        />
        
        {/* Add detection overlay */}
        <MapDetectionOverlay
          mapRef={containerRef}
          activeAlert={activeDetectionAlert}
          onCloseAlert={handleCloseDetectionAlert}
          onViewOnMap={handleViewAlertOnMap}
        />
      </div>

      {selectedThreat && (
        <ThreatDetails 
          selectedThreat={selectedThreat}
          clearSelectedThreat={clearSelectedThreat}
          className={isMobile ? "absolute bottom-16 left-0 right-0 max-h-64 overflow-auto z-20" : ""}
        />
      )}
    </div>
  );
};

export default React.memo(MapContainer);
