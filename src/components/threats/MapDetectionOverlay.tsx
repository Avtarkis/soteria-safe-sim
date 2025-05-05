
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import DetectionAlert from '../detection/DetectionAlert';
import { DetectionAlert as DetectionAlertType } from '@/types/detection';

interface MapDetectionOverlayProps {
  mapRef: React.RefObject<HTMLDivElement>;
  activeAlert: DetectionAlertType | null;
  onCloseAlert: () => void;
  onViewOnMap?: () => void;
}

const MapDetectionOverlay = ({
  mapRef,
  activeAlert,
  onCloseAlert,
  onViewOnMap
}: MapDetectionOverlayProps) => {
  const [overlayContainer, setOverlayContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create overlay container when component mounts
    if (mapRef.current && !overlayContainer) {
      const container = document.createElement('div');
      container.className = 'absolute top-16 right-4 z-50 w-full max-w-sm';
      mapRef.current.appendChild(container);
      setOverlayContainer(container);
    }

    // Clean up when component unmounts
    return () => {
      if (overlayContainer) {
        overlayContainer.remove();
      }
    };
  }, [mapRef, overlayContainer]);

  if (!overlayContainer || !activeAlert) return null;

  return createPortal(
    <DetectionAlert
      alert={activeAlert}
      onClose={onCloseAlert}
      onViewOnMap={onViewOnMap}
    />,
    overlayContainer
  );
};

export default MapDetectionOverlay;
