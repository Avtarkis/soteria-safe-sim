
import { useRef, useEffect } from 'react';
import { ThreatMarker } from '@/types/threats';

export const useMapContainerLayout = (filteredMarkers: ThreatMarker[], isMobile: boolean) => {
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
  
  // Define container style
  const containerStyle = { 
    border: '1px solid #e5e7eb', 
    borderRadius: '8px', 
    overflow: 'hidden',
    minHeight: '500px',
    display: 'block'
  };
  
  return {
    memoizedMarkers,
    containerStyle
  };
};
