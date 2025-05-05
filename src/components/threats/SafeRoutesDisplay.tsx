
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { MapPin, Route, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DisasterAlert } from '@/types/disasters';
import { weatherService } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';

interface SafeRoutesDisplayProps {
  userLocation: [number, number] | null;
  disasters: DisasterAlert[];
  destination?: [number, number];
}

const SafeRoutesDisplay = ({ userLocation, disasters, destination }: SafeRoutesDisplayProps) => {
  const { toast } = useToast();
  const [route, setRoute] = useState<{
    route: [number, number][];
    isSafe: boolean;
    warnings: string[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Calculate a route when user location, destination or disasters change
  useEffect(() => {
    const calculateSafeRoute = async () => {
      if (!userLocation || !destination) return;
      
      setLoading(true);
      try {
        const safeRoute = await weatherService.getSafeRoutes(
          userLocation,
          destination,
          disasters
        );
        setRoute(safeRoute);
      } catch (error) {
        console.error('Error calculating safe route:', error);
        toast({
          title: 'Route Error',
          description: 'Unable to calculate a safe route. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (userLocation && destination) {
      calculateSafeRoute();
    }
  }, [userLocation, destination, disasters, toast]);

  const handleRefreshRoute = () => {
    if (!userLocation || !destination) {
      toast({
        title: 'Location Required',
        description: 'Both your location and destination are needed to calculate a route.',
        variant: 'destructive',
      });
      return;
    }
    
    setRoute(null);
    setLoading(true);
    
    weatherService
      .getSafeRoutes(userLocation, destination, disasters)
      .then(safeRoute => {
        setRoute(safeRoute);
        toast({
          title: 'Route Updated',
          description: safeRoute.isSafe 
            ? 'A safe route has been found.' 
            : 'Route contains potential hazards.',
        });
      })
      .catch(error => {
        console.error('Error refreshing route:', error);
        toast({
          title: 'Route Error',
          description: 'Failed to refresh route information.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!userLocation) {
    return null;
  }

  return (
    <Card className={`bg-${route?.isSafe ? 'green' : 'orange'}-50 dark:bg-${route?.isSafe ? 'green' : 'orange'}-900/20 border border-${route?.isSafe ? 'green' : 'orange'}-200 dark:border-${route?.isSafe ? 'green' : 'orange'}-800`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Route className="h-4 w-4 text-primary" />
          Safe Routes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!destination ? (
          <div className="text-center py-3 text-sm text-muted-foreground">
            <MapPin className="h-5 w-5 mx-auto mb-2 opacity-50" />
            <p>Select a destination to see safe routes</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-3">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2 text-sm">Calculating safe route...</span>
          </div>
        ) : route ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {route.isSafe ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
              <p className="font-medium text-sm">
                {route.isSafe 
                  ? 'Safe route available' 
                  : 'Route has potential hazards'}
              </p>
            </div>
            
            {route.warnings.length > 0 && (
              <div className="space-y-1 mt-2">
                <p className="text-xs font-medium">Warnings:</p>
                <ul className="text-xs space-y-1">
                  {route.warnings.map((warning, index) => (
                    <li 
                      key={`warning-${index}`}
                      className="flex items-start gap-1.5"
                    >
                      <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2 text-xs" 
              onClick={handleRefreshRoute}
            >
              Refresh Route
            </Button>
          </div>
        ) : (
          <div className="text-center py-3 text-sm text-muted-foreground">
            <AlertTriangle className="h-5 w-5 mx-auto mb-2 opacity-50" />
            <p>Unable to calculate route</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-xs" 
              onClick={handleRefreshRoute}
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SafeRoutesDisplay;
