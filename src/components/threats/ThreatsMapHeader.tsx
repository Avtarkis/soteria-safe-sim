
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapIcon, Shield } from 'lucide-react';
import WeaponDetectionSystem from '../detection/WeaponDetectionSystem';

interface MapDestination {
  name: string;
  coordinates: [number, number];
}

interface ThreatsMapHeaderProps {
  destination: MapDestination;
}

const ThreatsMapHeader = ({ destination }: ThreatsMapHeaderProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapIcon className="h-7 w-7 text-primary/70" />
            Threat Map
          </h1>
          <p className="text-muted-foreground">
            View threat alerts and stay safe in {destination?.name || 'your area'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">Share Location</Button>
          <Button variant="outline" size="sm">Report Threat</Button>
          <Button variant="default" size="sm">Directions</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <WeaponDetectionSystem />
      </div>
    </div>
  );
};

export default ThreatsMapHeader;
