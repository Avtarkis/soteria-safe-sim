
import React from 'react';
import { MapIcon } from 'lucide-react';

interface ThreatsMapHeaderProps {
  destination: string | null;
}

const ThreatsMapHeader = ({ destination }: ThreatsMapHeaderProps) => {
  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center gap-3">
        <MapIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Threat Map</h1>
      </div>
      <p className="text-muted-foreground">
        Real-time global threat visualization with AI risk assessment.
      </p>
      
      {destination && (
        <div className="mt-2 p-3 bg-primary/10 rounded-md">
          <p className="text-sm font-medium">
            Currently showing safest route to your {destination} location.
          </p>
        </div>
      )}
    </div>
  );
};

export default ThreatsMapHeader;
