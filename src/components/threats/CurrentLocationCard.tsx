
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Locate, MapPin } from 'lucide-react';
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
  const [streetName, setStreetName] = useState<string | null>(null);
  const [isLoadingStreet, setIsLoadingStreet] = useState(false);
  
  // Get street name using reverse geocoding
  useEffect(() => {
    if (!userLocation) return;
    
    const fetchStreetName = async () => {
      setIsLoadingStreet(true);
      try {
        // Use Open Street Map API for better street details
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation[0]}&lon=${userLocation[1]}&zoom=18&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'SoteriaSafeSim/1.0'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Geocoding error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract street name or nearest named feature with improved logic
        let locationName = '';
        
        if (data.address) {
          const { road, street, pedestrian, path, footway, residential, house_number, city, suburb, neighbourhood, county, state, postcode } = data.address;
          
          // Try to get the most specific street information
          const streetInfo = road || street || pedestrian || path || footway || residential || '';
          const houseNum = house_number ? `${house_number}, ` : '';
          
          if (streetInfo) {
            locationName = `${houseNum}${streetInfo}`;
            
            // Add city/area if available for better context
            const localArea = suburb || neighbourhood || '';
            
            if (localArea && city) {
              locationName += `, ${localArea}, ${city}`;
            } else if (city) {
              locationName += `, ${city}`;
            } else if (localArea) {
              locationName += `, ${localArea}`;
            } else if (county) {
              locationName += `, ${county}`;
            }
            
            // Add postal code if available
            if (postcode && !locationName.includes(postcode)) {
              locationName += ` ${postcode}`;
            }
          } else if (data.name) {
            locationName = data.name;
            if (city) locationName += `, ${city}`;
          } else {
            // Use any other available location data if street name not found
            const locality = suburb || neighbourhood || city || county || '';
            if (locality) {
              locationName = locality;
              if (state) locationName += `, ${state}`;
            }
          }
        }
        
        // If we couldn't find a street name, use the display_name but shortened
        if (!locationName && data.display_name) {
          locationName = data.display_name.split(',').slice(0, 3).join(',');
        }
        
        setStreetName(locationName || 'Your current location');
        console.log("Retrieved location name:", locationName);
      } catch (error) {
        console.error("Error fetching street name:", error);
        setStreetName('Location information unavailable');
      } finally {
        setIsLoadingStreet(false);
      }
    };
    
    fetchStreetName();
  }, [userLocation]);
  
  if (!userLocation) return null;
  
  const handleToggleTracking = () => {
    toggleUserLocation();
    
    // Dispatch high precision mode event when enabling
    if (!showUserLocation) {
      document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
    }
    
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
        <CardTitle className="text-base flex items-center">
          <MapPin className="h-4 w-4 mr-2" /> 
          Your Current Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        {streetName && (
          <div className="mb-3 bg-muted/50 p-2 rounded-md border border-border">
            <p className="text-sm font-medium truncate">{streetName}</p>
          </div>
        )}
        <div className="text-sm text-muted-foreground mb-2">
          <p className="font-medium text-foreground">Coordinates:</p>
          <p>Lat: {userLocation[0].toFixed(8)}</p>
          <p>Lng: {userLocation[1].toFixed(8)}</p>
          {locationAccuracy && (
            <p className={cn(
              "font-medium",
              locationAccuracy > 100 ? "text-red-500" : 
              locationAccuracy > 20 ? "text-yellow-500" : "text-green-500"
            )}>
              Accuracy: ±{locationAccuracy < 1 ? locationAccuracy.toFixed(2) : locationAccuracy.toFixed(1)} meters
            </p>
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
