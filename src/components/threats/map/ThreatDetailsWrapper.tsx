
import React from 'react';
import ThreatDetails from '../ThreatDetails';
import { ThreatMarker } from '@/types/threats';

interface ThreatDetailsWrapperProps {
  selectedThreat: ThreatMarker | null;
  clearSelectedThreat: () => void;
  isMobile: boolean;
}

/**
 * Wrapper for threat details display
 */
const ThreatDetailsWrapper = ({
  selectedThreat,
  clearSelectedThreat,
  isMobile
}: ThreatDetailsWrapperProps) => {
  if (!selectedThreat) return null;
  
  return (
    <ThreatDetails 
      selectedThreat={selectedThreat}
      clearSelectedThreat={clearSelectedThreat}
      className={isMobile ? "absolute bottom-16 left-0 right-0 max-h-64 overflow-auto z-20" : ""}
    />
  );
};

export default ThreatDetailsWrapper;
