
import React, { useEffect, useState, useRef, useCallback } from 'react';
import LeafletMap from '@/components/ui/LeafletMap';
import ThreatDetails from './ThreatDetails';
import { ThreatMarker } from '@/types/threats';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  // Create a stable key to prevent unnecessary re-creation
  const mapContainerKey = useRef(`map-container-${Date.now()}`).current;
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  // Effect to ensure the map takes up full viewport height on mobile
  useEffect(() => {
    const adjustHeight = () => {
      if (containerRef.current && isMobile) {
        const viewportHeight = window.innerHeight;
        const position = containerRef.current.getBoundingClientRect();
        const topOffset = position.top;
        const availableHeight = viewportHeight - topOffset - 120; // Leave space for buttons at bottom
        
        containerRef.current.style.height = `${Math.max(400, availableHeight)}px`;
        
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
        isMobile ? "h-[60vh]" : "h-full"
      )} 
      key={mapContainerKey}
      ref={containerRef}
    >
      <div 
        className="h-full w-full relative" 
        style={{ minHeight: isMobile ? '400px' : '380px' }}
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
          className={isMobile ? "absolute bottom-16 left-0 right-0 max-h-64 overflow-auto z-20" : ""}
        />
      )}
    </div>
  );
};

export default React.memo(MapContainer);
