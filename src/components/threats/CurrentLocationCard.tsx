
import React from 'react';
import { Card, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { MapPin, Locate, AlertTriangle, Check, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CurrentLocationCardProps {
  userLocation: [number, number] | null;
  locationAccuracy: number | null;
  showUserLocation: boolean;
  toggleUserLocation: () => void;
}

const CurrentLocationCard = ({ 
  userLocation, 
  locationAccuracy, 
  showUserLocation,
  toggleUserLocation
}: CurrentLocationCardProps) => {
  const { toast } = useToast();
  
  // Format coordinates for display
  const formatCoordinate = (coordinate: number): string => {
    return coordinate.toFixed(6);
  };
  
  // Determine accuracy level for styling
  const getAccuracyLevel = (accuracy: number | null): 'high' | 'medium' | 'low' => {
    if (!accuracy) return 'low';
    if (accuracy < 100) return 'high';
    if (accuracy < 1000) return 'medium';
    return 'low';
  };
  
  // Format accuracy for display
  const formatAccuracy = (accuracy: number | null): string => {
    if (!accuracy) return 'Unknown';
    if (accuracy < 1) return `±${accuracy.toFixed(2)}m`;
    if (accuracy < 10000) return `±${accuracy.toFixed(1)}m`;
    return `±${(accuracy / 1000).toFixed(1)}km`;
  };
  
  // Get accuracy color based on level
  const getAccuracyColor = (level: 'high' | 'medium' | 'low'): string => {
    if (level === 'high') return 'text-green-500';
    if (level === 'medium') return 'text-amber-500';
    return 'text-foreground';
  };
  
  const accuracyLevel = getAccuracyLevel(locationAccuracy);
  const accuracyColor = getAccuracyColor(accuracyLevel);
  
  // Handle enabling high precision tracking
  const handleHighPrecisionTracking = () => {
    // Trigger high precision mode
    document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
    
    // Center map on user location
    document.dispatchEvent(new CustomEvent('centerMapOnUserLocation'));
    
    toast({
      title: "High Precision Tracking",
      description: "Activating precise location tracking...",
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <h3 className="font-medium">Your Location</h3>
          </div>
          <Button 
            variant={showUserLocation ? "default" : "outline"} 
            size="sm"
            onClick={toggleUserLocation}
          >
            {showUserLocation ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Active
              </>
            ) : (
              <>
                <Locate className="h-3.5 w-3.5 mr-1.5" />
                Track
              </>
            )}
          </Button>
        </div>
        
        {userLocation ? (
          <>
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Latitude</span>
                <span className="font-mono">{formatCoordinate(userLocation[0])}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Longitude</span>
                <span className="font-mono">{formatCoordinate(userLocation[1])}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <span className="mr-1">Accuracy:</span>
                <span className={cn("font-medium", accuracyColor)}>
                  {formatAccuracy(locationAccuracy)}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleHighPrecisionTracking}
              >
                <Navigation className="h-3 w-3 mr-1" />
                High Precision
              </Button>
            </div>
            
            <div className="mt-3 pt-3 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  // First activate high precision mode
                  document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
                  
                  // Then center map on the location
                  document.dispatchEvent(new CustomEvent('centerMapOnUserLocation'));
                  
                  toast({
                    title: "Map Centered",
                    description: "Map centered on your exact location",
                  });
                }}
              >
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                Center Map on My Location
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              Location not available. Please enable location services.
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleHighPrecisionTracking}
            >
              <Locate className="h-3.5 w-3.5 mr-1.5" />
              Try High Precision Tracking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentLocationCard;
