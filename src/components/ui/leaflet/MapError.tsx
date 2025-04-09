
import React from 'react';

interface MapErrorProps {
  error: string | null;
  onRetry: () => void;
}

/**
 * Component to display map errors
 */
const MapError = ({ error, onRetry }: MapErrorProps) => {
  if (!error) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
      <div className="p-4 bg-background border rounded shadow-lg">
        <h3 className="text-lg font-medium">Map Error</h3>
        <p className="text-sm text-destructive my-2">{error}</p>
        <button 
          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
          onClick={onRetry}
        >
          Reload Map
        </button>
      </div>
    </div>
  );
};

export default MapError;
