
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ThreatMarker } from '@/types/threats';
import { DetectionAlert } from '@/types/detection';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import MapContent from './MapContent';
import DetectionOverlayWrapper from './DetectionOverlayWrapper';
import ThreatDetailsWrapper from './ThreatDetailsWrapper';
import { useMapContainerLayout } from '@/hooks/threats/useMapContainerLayout';
import { useMapDetectionEvents } from '@/hooks/threats/useMapDetectionEvents';

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
  const mapContainerKey = useRef(`map-container-${Date.now()}`).current;
  
  // Extract map container layout logic
  const { memoizedMarkers, containerStyle } = useMapContainerLayout(filteredMarkers, isMobile);
  
  // Extract detection events logic
  const { 
    activeDetectionAlert, 
    handleCloseDetectionAlert, 
    handleViewAlertOnMap 
  } = useMapDetectionEvents(mapRef);
  
  // Handle resize once after initial render
  useEffect(() => {
    if (mapRef.current && !containerRef.current) return;
    
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize(true);
        console.log("Map container: invalidated size");
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [mapRef]);

  return (
    <div 
      className={cn(
        "relative w-full", 
        isMobile ? "h-[70vh]" : "h-[600px]"
      )} 
      key={mapContainerKey}
      ref={containerRef}
      style={containerStyle}
    >
      <MapContent
        mapRef={mapRef}
        filteredMarkers={memoizedMarkers.current}
        handleThreatClick={handleThreatClick}
        userLocation={userLocation}
        showUserLocation={showUserLocation}
      />
      
      <DetectionOverlayWrapper
        containerRef={containerRef}
        activeAlert={activeDetectionAlert}
        onCloseAlert={handleCloseDetectionAlert}
        onViewOnMap={handleViewAlertOnMap}
      />

      <ThreatDetailsWrapper 
        selectedThreat={selectedThreat}
        clearSelectedThreat={clearSelectedThreat}
        isMobile={isMobile}
      />
    </div>
  );
};

export default React.memo(MapContainer);
