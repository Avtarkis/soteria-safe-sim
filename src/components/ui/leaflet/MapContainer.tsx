
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface MapContainerProps {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Component to provide consistent styling for map container
 */
const MapContainer = ({ className, children, style }: MapContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Default styles that ensure the map is visible
  const defaultStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    minHeight: '500px',
    position: 'relative',
    backgroundColor: '#f0f0f0',
    ...style
  };

  return (
    <div 
      className={cn("h-full w-full min-h-[500px] relative", className)}
      ref={containerRef}
      style={defaultStyle}
    >
      {children}
    </div>
  );
};

export default MapContainer;
