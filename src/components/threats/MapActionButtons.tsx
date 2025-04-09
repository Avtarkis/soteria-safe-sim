
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Crosshair, Navigation, Eye, EyeOff, RefreshCw, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface MapActionButtonsProps {
  showUserLocation: boolean;
  toggleUserLocation: () => void;
  showLegend: boolean;
  setShowLegend: (show: boolean) => void;
  handleRefresh: () => void;
  refreshing: boolean;
  userLocation: [number, number] | null;
}

const MapActionButtons = ({
  showUserLocation,
  toggleUserLocation,
  showLegend,
  setShowLegend,
  handleRefresh,
  refreshing,
  userLocation
}: MapActionButtonsProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Create a stable callback for centering the map
  const handleCenterMap = useCallback(() => {
    if (userLocation) {
      toast({
        title: "Location Updated",
        description: "Map centered on your current location.",
      });
      
      // Dispatch an event that the map can listen for to center
      const event = new CustomEvent('centerMapOnUserLocation', {
        detail: { lat: userLocation[0], lng: userLocation[1] }
      });
      document.dispatchEvent(event);
    } else {
      toast({
        title: "Location Not Available",
        description: "Unable to center map. Your location is not available.",
        variant: "destructive"
      });
    }
  }, [userLocation, toast]);
  
  // Handle activation of high precision tracking
  const handleActivateHighPrecision = useCallback(() => {
    // Fire custom event that the map and location hooks listen for
    document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
    
    // Toggle user location on if it's not already
    if (!showUserLocation) {
      toggleUserLocation();
    }
    
    // Show notification
    toast({
      title: "High Precision Activated",
      description: "Attempting to get your precise location... every second counts.",
    });
  }, [showUserLocation, toggleUserLocation, toast]);
  
  // Create a memoized toggle for location tracking
  const handleToggleLocation = useCallback(() => {
    toggleUserLocation();
    
    // Add toast notification
    toast({
      title: showUserLocation ? "Tracking Disabled" : "Tracking Enabled",
      description: showUserLocation 
        ? "Live location tracking has been turned off." 
        : "Your location will now be tracked in real-time. Where every second counts.",
    });
  }, [showUserLocation, toggleUserLocation, toast]);
  
  return (
    <div className={cn(
      "absolute top-4 left-4 z-30",
      isMobile ? "space-y-1.5" : "space-y-2"
    )}>
      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "default"}
        className={cn(
          "shadow-sm backdrop-blur-sm",
          showUserLocation 
            ? "bg-primary text-white border-primary" 
            : "bg-background/80"
        )}
        onClick={handleToggleLocation}
      >
        <Crosshair className={cn("h-4 w-4 mr-1", showUserLocation && "text-white")} />
        <span>{isMobile ? "Track Me" : "Track My Location"}</span>
      </Button>
      
      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "default"}
        className="shadow-sm bg-background/80 backdrop-blur-sm"
        onClick={handleCenterMap}
        disabled={!userLocation}
      >
        <Navigation className="h-4 w-4 mr-1" />
        <span>{isMobile ? "Center" : "Center Map"}</span>
      </Button>
      
      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "default"}
        className="shadow-sm bg-background/80 backdrop-blur-sm"
        onClick={() => setShowLegend(!showLegend)}
      >
        {showLegend ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
        <span>{isMobile ? "Legend" : (showLegend ? "Hide Legend" : "Show Legend")}</span>
      </Button>
      
      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "default"}
        className="shadow-sm bg-background/80 backdrop-blur-sm"
        onClick={handleRefresh}
        disabled={refreshing}
      >
        <RefreshCw className={cn("h-4 w-4 mr-1", refreshing && "animate-spin")} />
        <span>{isMobile ? "Refresh" : "Refresh Data"}</span>
      </Button>
      
      <Button 
        variant="default" 
        size={isMobile ? "sm" : "default"}
        className="shadow-md"
        onClick={handleActivateHighPrecision}
      >
        <MapPin className="h-4 w-4 mr-1" />
        <span>{isMobile ? "High Precision" : "High Precision Mode"}</span>
      </Button>
    </div>
  );
};

export default MapActionButtons;
