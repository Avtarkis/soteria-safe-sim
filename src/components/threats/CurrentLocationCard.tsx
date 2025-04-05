
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Locate } from 'lucide-react';
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
  
  if (!userLocation) return null;
  
  const handleToggleTracking = () => {
    toggleUserLocation();
    
    // Add toast notification
    toast({
      title: showUserLocation ? "High-Precision Tracking Disabled" : "High-Precision Tracking Enabled",
      description: showUserLocation 
        ? "Location tracking has been turned off." 
        : "Your location is now being tracked with maximum precision.",
    });
    
    // Center the map on user when enabling tracking
    if (!showUserLocation && userLocation) {
      setTimeout(() => {
        const event = new CustomEvent('centerMapOnUserLocation', {
          detail: { lat: userLocation[0], lng: userLocation[1] }
        });
        document.dispatchEvent(event);
      }, 200); // Small delay to ensure map is ready
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Your Current Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-2">
          <p className="font-medium text-foreground">Coordinates:</p>
          <p>Lat: {userLocation[0].toFixed(8)}</p>
          <p>Lng: {userLocation[1].toFixed(8)}</p>
          {locationAccuracy && (
            <p>Accuracy: ±{locationAccuracy < 1 ? locationAccuracy.toFixed(2) : locationAccuracy.toFixed(1)} meters</p>
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button 
            variant={showUserLocation ? "default" : "outline"} 
            size="sm" 
            onClick={handleToggleTracking}
            className={cn(
              "font-medium w-full",
              showUserLocation 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-primary text-primary hover:bg-primary/10"
            )}
          >
            <Locate className="h-4 w-4 mr-2" />
            <span className="font-medium">
              {showUserLocation ? "High-Precision Tracking On" : "Enable High-Precision Tracking"}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentLocationCard;
