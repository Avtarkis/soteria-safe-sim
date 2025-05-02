
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isMobile } from '@/utils/platformUtils';

interface NavigationServiceProps {
  destination: {
    name: string;
    coordinates: [number, number];
  };
  onNavigate?: () => void;
}

// Custom hook that provides navigation functionality
export const useNavigationService = ({ destination, onNavigate }: NavigationServiceProps) => {
  const { toast } = useToast();

  const startNavigation = useCallback(() => {
    if (!destination) {
      toast({
        title: "No destination set",
        description: "Please select a destination to navigate to.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Format destination coordinates for maps URL
      const lat = destination.coordinates[0];
      const lng = destination.coordinates[1];
      let mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      
      // Add destination name if available
      if (destination.name) {
        mapsUrl += `&destination_place_id=${encodeURIComponent(destination.name)}`;
      }

      // Use Web Share API on mobile devices if available
      if (isMobile() && 'share' in navigator) {
        navigator.share({
          title: `Navigate to ${destination.name}`,
          text: `Directions to ${destination.name}`,
          url: mapsUrl
        }).catch(() => {
          // Fallback to opening in a new tab
          window.open(mapsUrl, '_blank');
        });
      } else {
        // For non-mobile or if share API fails
        window.open(mapsUrl, '_blank');
      }
      
      toast({
        title: "Navigation Started",
        description: `Directions to ${destination.name} have been opened.`,
      });
      
      // Call the onNavigate callback if provided
      if (onNavigate) {
        onNavigate();
      }
    } catch (error) {
      console.error("Navigation error:", error);
      toast({
        title: "Navigation Failed",
        description: "Could not open navigation. Please try again.",
        variant: "destructive"
      });
    }
  }, [destination, onNavigate, toast]);

  return { startNavigation };
};

// Export default for backward compatibility
export default useNavigationService;
