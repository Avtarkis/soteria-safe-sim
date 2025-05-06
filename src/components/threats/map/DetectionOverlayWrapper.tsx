
import React from 'react';
import MapDetectionOverlay from '../MapDetectionOverlay';
import { DetectionAlert } from '@/types/detection';

interface DetectionOverlayWrapperProps {
  containerRef: React.RefObject<HTMLDivElement>;
  activeAlert: DetectionAlert | null;
  onCloseAlert: () => void;
  onViewOnMap: () => void;
}

/**
 * Wrapper for detection alerts overlay
 */
const DetectionOverlayWrapper = ({
  containerRef,
  activeAlert,
  onCloseAlert,
  onViewOnMap
}: DetectionOverlayWrapperProps) => {
  return (
    <MapDetectionOverlay
      mapRef={containerRef}
      activeAlert={activeAlert}
      onCloseAlert={onCloseAlert}
      onViewOnMap={onViewOnMap}
    />
  );
};

export default DetectionOverlayWrapper;
