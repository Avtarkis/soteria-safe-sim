
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crosshair, Navigation, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  
  return (
    <div className="absolute top-4 left-4 z-10 space-y-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="shadow-sm bg-background/80 backdrop-blur-sm"
        onClick={toggleUserLocation}
      >
        <Crosshair className={cn("h-4 w-4 mr-1", showUserLocation && "text-primary")} />
        <span>{showUserLocation ? "Tracking On" : "Track My Location"}</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="shadow-sm bg-background/80 backdrop-blur-sm"
        onClick={() => {
          if (userLocation) {
            toast({
              title: "Location Updated",
              description: "Map centered on your current location.",
            });
          }
        }}
      >
        <Navigation className="h-4 w-4 mr-1" />
        <span>Center Map</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="shadow-sm bg-background/80 backdrop-blur-sm"
        onClick={() => setShowLegend(!showLegend)}
      >
        {showLegend ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
        <span>{showLegend ? "Hide Legend" : "Show Legend"}</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="shadow-sm bg-background/80 backdrop-blur-sm"
        onClick={handleRefresh}
        disabled={refreshing}
      >
        <RefreshCw className={cn("h-4 w-4 mr-1", refreshing && "animate-spin")} />
        <span>Refresh Data</span>
      </Button>
    </div>
  );
};

export default MapActionButtons;
