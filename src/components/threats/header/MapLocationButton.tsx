
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapIcon } from 'lucide-react';

interface MapLocationButtonProps {
  destination: {
    name: string;
    coordinates: [number, number];
  };
}

const MapLocationButton = ({ destination }: MapLocationButtonProps) => {
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
  
  return (
    <Button variant="outline" size="sm" onClick={handleShareLocation}>
      <MapIcon className="mr-1 h-4 w-4" />
      Share Location
    </Button>
  );
};

export default MapLocationButton;
