
import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

interface DirectionsButtonProps {
  destination: {
    name: string;
    coordinates: [number, number];
  };
}

const DirectionsButton = ({ destination }: DirectionsButtonProps) => {
  const handleGetDirections = () => {
    document.dispatchEvent(new CustomEvent('getDirectionsFromCurrentLocation', {
      detail: { destination: destination.coordinates }
    }));
  };
  
  return (
    <Button variant="default" size="sm" onClick={handleGetDirections}>
      <Navigation className="mr-1 h-4 w-4" />
      Directions
    </Button>
  );
};

export default DirectionsButton;
