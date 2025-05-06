
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ThreatMarker } from '@/types/threats';
import { DetectionAlert } from '@/types/detection';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import MapContent from './map/MapContent';
import DetectionOverlayWrapper from './map/DetectionOverlayWrapper';
import ThreatDetailsWrapper from './map/ThreatDetailsWrapper';

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
  const [activeDetectionAlert, setActiveDetectionAlert] = useState<DetectionAlert | null>(null);
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

  // Listen for weapon detection events
  useEffect(() => {
    const handleDetectionEvent = (e: CustomEvent) => {
      const alert: DetectionAlert = e.detail;
      
      if (alert) {
        console.log('Weapon detection alert received:', alert);
        setActiveDetectionAlert(alert);
      }
    };

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
    if (activeDetectionAlert?.location && mapRef.current) {
      mapRef.current.setView(activeDetectionAlert.location, 18);
      handleCloseDetectionAlert();
    }
  }, [activeDetectionAlert, mapRef, handleCloseDetectionAlert]);

  // Adjust map height for mobile
  useEffect(() => {
    const adjustHeight = () => {
      if (!containerRef.current || !isMobile) return;
      
      const viewportHeight = window.innerHeight;
      const position = containerRef.current.getBoundingClientRect();
      const topOffset = position.top;
      const availableHeight = viewportHeight - topOffset - 120;
      
      containerRef.current.style.height = `${Math.max(500, availableHeight)}px`;
      
      if (mapRef.current) {
        setTimeout(() => mapRef.current?.invalidateSize(true), 100);
      }
    };
    
    adjustHeight();
    window.addEventListener('resize', adjustHeight);
    
    return () => window.removeEventListener('resize', adjustHeight);
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
        display: 'block'
      }}
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
