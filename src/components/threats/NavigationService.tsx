
import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface NavigationServiceProps {
  destination: {
    name: string;
    coordinates: [number, number];
  };
  onNavigate: () => void;
}

const NavigationService: React.FC<NavigationServiceProps> = ({ destination, onNavigate }) => {
  const { toast } = useToast();

  const startNavigation = () => {
    // Check if native navigation is available
    if ('geolocation' in navigator && 'share' in navigator) {
      // Format for map URLs
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.coordinates[0]},${destination.coordinates[1]}&destination_place_id=${destination.name}`;
      
      // Try to use Web Share API for mobile devices
      navigator.share({
        title: `Navigate to ${destination.name}`,
        text: `Directions to ${destination.name}`,
        url: mapsUrl
      }).catch(() => {
        // Fallback - open in new tab
        window.open(mapsUrl, '_blank');
      });
    } else {
      // Fallback for browsers without geolocation or Web Share API
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination.coordinates[0]},${destination.coordinates[1]}`;
      window.open(mapsUrl, '_blank');
    }
    
    // Show toast confirmation
    toast({
      title: "Navigation Started",
      description: `Directions to ${destination.name} have been opened.`,
    });
    
    // Call the onNavigate callback
    onNavigate();
  };

  return { startNavigation };
};

export default NavigationService;
