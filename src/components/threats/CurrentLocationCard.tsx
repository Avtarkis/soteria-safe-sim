
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  if (!userLocation) return null;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Your Current Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-2">
          <p className="font-medium text-foreground">Coordinates:</p>
          <p>Lat: {userLocation[0].toFixed(6)}</p>
          <p>Lng: {userLocation[1].toFixed(6)}</p>
          {locationAccuracy && (
            <p>Accuracy: ±{locationAccuracy.toFixed(1)} meters</p>
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button 
            variant={showUserLocation ? "default" : "outline"} 
            size="sm" 
            onClick={toggleUserLocation}
            className={cn(
              "font-medium w-full",
              showUserLocation 
                ? "bg-primary text-primary-foreground" 
                : "bg-background border-primary text-primary hover:bg-primary/90 hover:text-primary-foreground"
            )}
          >
            <Crosshair className="h-4 w-4 mr-2" />
            <span className="font-medium">
              {showUserLocation ? "Live Tracking On" : "Enable Live Tracking"}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentLocationCard;
