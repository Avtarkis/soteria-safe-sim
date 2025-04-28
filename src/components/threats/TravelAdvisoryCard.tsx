
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Route, Globe, ShieldAlert, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface TravelAdvisoryCardProps {
  userLocation?: [number, number] | null;
  countryCode?: string;
}

const TravelAdvisoryCard = ({ userLocation, countryCode }: TravelAdvisoryCardProps = {}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locationInfo, setLocationInfo] = useState({ 
    region: "your area", 
    advisoryLevel: "normal",
    countryName: "your country"
  });
  
  // Determine location information based on coordinates
  useEffect(() => {
    if (!userLocation) return;
    
    const [lat, lng] = userLocation;
    
    // Simple region detection based on coordinates
    let region = "your area";
    let advisoryLevel = "normal";
    let countryName = "your country";
    
    // North America
    if (lat > 24 && lat < 50 && lng > -125 && lng < -66) {
      if (lat > 40 && lat < 50 && lng > -80 && lng < -70) {
        region = "Northeast US";
        countryName = "United States";
        advisoryLevel = "normal";
      } else if (lat > 32 && lat < 42 && lng > -125 && lng < -115) {
        region = "California";
        countryName = "United States";
        advisoryLevel = "caution";
      } else if (lat > 30 && lat < 40 && lng > -100 && lng < -90) {
        region = "Texas";
        countryName = "United States";
        advisoryLevel = "normal";
      }
    }
    
    // Europe
    if (lat > 35 && lat < 60 && lng > -10 && lng < 30) {
      if (lat > 48 && lat < 55 && lng > -5 && lng < 10) {
        region = "United Kingdom";
        countryName = "United Kingdom";
        advisoryLevel = "normal";
      } else if (lat > 40 && lat < 48 && lng > 0 && lng < 10) {
        region = "France";
        countryName = "France";
        advisoryLevel = "normal";
      }
    }
    
    // Africa
    if (lat > -35 && lat < 15 && lng > -20 && lng < 50) {
      if (lat > 5 && lat < 15 && lng > 0 && lng < 15) {
        region = "Nigeria";
        countryName = "Nigeria";
        advisoryLevel = "caution";
      } else if (lat > -35 && lat < -25 && lng > 15 && lng < 35) {
        region = "South Africa";
        countryName = "South Africa";
        advisoryLevel = "normal";
      }
    }
    
    // Asia
    if (lat > 0 && lat < 60 && lng > 60 && lng < 180) {
      if (lat > 10 && lat < 25 && lng > 70 && lng < 90) {
        region = "India";
        countryName = "India";
        advisoryLevel = "normal";
      } else if (lat > 30 && lat < 45 && lng > 110 && lng < 130) {
        region = "China";
        countryName = "China";
        advisoryLevel = "normal";
      }
    }
    
    setLocationInfo({ region, advisoryLevel, countryName });
  }, [userLocation]);
  
  const handlePlanTravel = () => {
    navigate('/travel');
  };
  
  const handleCheckAdvisories = async () => {
    setLoading(true);
    
    // Simulate loading delay
    toast({
      title: "Loading Advisories",
      description: `Fetching the latest travel advisories for ${locationInfo.region} where every second counts.`,
    });
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Travel Advisories Updated",
        description: `Latest advisories for ${locationInfo.region} loaded - travel with confidence when every second counts.`,
      });
      
      // Open dialog or navigate to advisories page
      navigate('/travel?tab=advisories');
    }, 1500);
  };
  
  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          Travel Advisory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
              <ShieldAlert className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {locationInfo.countryName} Travel Advisory
              </p>
              <p className="text-xs text-muted-foreground">
                {locationInfo.advisoryLevel === "caution" ? (
                  <span className="text-amber-500 font-medium">Exercise caution</span>
                ) : locationInfo.advisoryLevel === "warning" ? (
                  <span className="text-red-500 font-medium">Travel warning in effect</span>
                ) : (
                  <span className="text-green-500 font-medium">Normal precautions</span>
                )} for travel to {locationInfo.region}.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
              <Route className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">AI-Powered Safe Routes</p>
              <p className="text-xs text-muted-foreground">
                Get AI-generated safest routes in {locationInfo.region} based on real-time threats. Where every second counts.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={handleCheckAdvisories}
              disabled={loading}
            >
              {loading ? "Loading..." : "Check Advisories"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={handlePlanTravel}
            >
              Plan Safe Travel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelAdvisoryCard;
