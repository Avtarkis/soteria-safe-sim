
import React from 'react';
import WeaponDetectionSystem from '../detection/WeaponDetectionSystem';
import MapHeaderTitle from './header/MapHeaderTitle';
import MapLocationButton from './header/MapLocationButton';
import ReportThreatButton from './header/ReportThreatButton';
import DirectionsButton from './header/DirectionsButton';

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
        <MapHeaderTitle destination={destination} />
        
        <div className="flex flex-wrap gap-2">
          <MapLocationButton destination={destination} />
          <ReportThreatButton destination={destination} />
          <DirectionsButton destination={destination} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <WeaponDetectionSystem />
      </div>
    </div>
  );
};

export default ThreatsMapHeader;
