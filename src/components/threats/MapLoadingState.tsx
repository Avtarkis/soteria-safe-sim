
import React from 'react';
import { MapIcon } from 'lucide-react';

const MapLoadingState = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center">
        <MapIcon className="h-10 w-10 text-muted-foreground animate-pulse" />
        <p className="mt-2 text-muted-foreground">Loading threat map...</p>
      </div>
    </div>
  );
};

export default MapLoadingState;
