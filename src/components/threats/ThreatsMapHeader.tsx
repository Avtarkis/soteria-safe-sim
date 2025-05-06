
import React from 'react';
import MapHeaderTitle from './header/MapHeaderTitle';
import ReportThreatButton from './header/ReportThreatButton';
import DirectionsButton from './header/DirectionsButton';
import { EmergencyButtonGroup } from './header/EmergencyButtonGroup';

interface ThreatsMapHeaderProps {
  destination: {
    name: string;
    coordinates: [number, number];
  };
}

const ThreatsMapHeader = ({ destination }: ThreatsMapHeaderProps) => {
  return (
    <div className="flex flex-col gap-2 pb-4 md:pb-6">
      <div className="flex justify-between items-center">
        <MapHeaderTitle destination={destination} />
        
        <div className="flex items-center gap-2">
          <EmergencyButtonGroup />
          <ReportThreatButton destination={destination} />
          <DirectionsButton destination={destination} />
        </div>
      </div>
    </div>
  );
};

export default ThreatsMapHeader;
