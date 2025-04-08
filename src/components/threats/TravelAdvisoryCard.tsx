
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Route, Globe, ShieldAlert, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const TravelAdvisoryCard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const handlePlanTravel = () => {
    navigate('/travel');
  };
  
  const handleCheckAdvisories = async () => {
    setLoading(true);
    
    // Simulate loading delay
    toast({
      title: "Loading Advisories",
      description: "Fetching the latest travel advisories where every second counts.",
    });
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Travel Advisories Updated",
        description: "Latest advisories loaded - travel with confidence when every second counts.",
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
              <p className="text-sm font-medium">Local Travel Advisory</p>
              <p className="text-xs text-muted-foreground">
                Travel advisories for your current area. Every second counts when traveling safely.
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
                Get AI-generated safest routes based on real-time threats. Where every second counts.
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
