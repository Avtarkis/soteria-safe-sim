
import React from 'react';
import { MapIcon } from 'lucide-react';

interface MapHeaderTitleProps {
  destination: {
    name: string;
    coordinates: [number, number];
  };
}

const MapHeaderTitle = ({ destination }: MapHeaderTitleProps) => {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <MapIcon className="h-7 w-7 text-primary/70" />
        Threat Map
      </h1>
      <p className="text-muted-foreground">
        View threat alerts and stay safe in {destination?.name || 'your area'}
      </p>
    </div>
  );
};

export default MapHeaderTitle;
