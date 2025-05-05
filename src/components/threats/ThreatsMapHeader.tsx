
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapIcon, Shield, Navigation } from 'lucide-react';
import WeaponDetectionSystem from '../detection/WeaponDetectionSystem';

interface MapDestination {
  name: string;
  coordinates: [number, number];
}

interface ThreatsMapHeaderProps {
  destination: MapDestination;
}

const ThreatsMapHeader = ({ destination }: ThreatsMapHeaderProps) => {
  // Function to handle sharing the user's location
  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Current Location',
        text: `I'm currently at ${destination.name}`,
        url: `https://maps.google.com/?q=${destination.coordinates[0]},${destination.coordinates[1]}`
      }).catch(error => console.log('Error sharing location:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(
        `https://maps.google.com/?q=${destination.coordinates[0]},${destination.coordinates[1]}`
      ).then(() => {
        alert('Location link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy location:', err);
      });
    }
  };
  
  // Function to report a threat
  const handleReportThreat = () => {
    document.dispatchEvent(new CustomEvent('openReportThreatDialog', {
      detail: { location: destination.coordinates }
    }));
  };
  
  // Function to get directions
  const handleGetDirections = () => {
    document.dispatchEvent(new CustomEvent('getDirectionsFromCurrentLocation', {
      detail: { destination: destination.coordinates }
    }));
  };

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
          <Button variant="outline" size="sm" onClick={handleShareLocation}>
            <MapIcon className="mr-1 h-4 w-4" />
            Share Location
          </Button>
          <Button variant="outline" size="sm" onClick={handleReportThreat}>
            <Shield className="mr-1 h-4 w-4" />
            Report Threat
          </Button>
          <Button variant="default" size="sm" onClick={handleGetDirections}>
            <Navigation className="mr-1 h-4 w-4" />
            Directions
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <WeaponDetectionSystem />
      </div>
    </div>
  );
};

export default ThreatsMapHeader;
