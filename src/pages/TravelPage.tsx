
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, Shield, AlertCircle, Route, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TravelPage = () => {
  const { toast } = useToast();
  const [destination, setDestination] = useState('');
  const [planningRoute, setPlanningRoute] = useState(false);

  const handlePlanRoute = () => {
    if (!destination) {
      toast({
        title: "Destination Required",
        description: "Please enter a destination to plan a safe route",
        variant: "destructive"
      });
      return;
    }

    setPlanningRoute(true);
    
    // Simulate AI route planning
    toast({
      title: "AI Planning in Progress",
      description: "Where every second counts - calculating safest route to " + destination,
    });
    
    setTimeout(() => {
      setPlanningRoute(false);
      toast({
        title: "Safe Route Ready",
        description: "We've identified the safest path to " + destination + ". Every second counts when traveling safely."
      });
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Travel Safety</h1>
        <p className="text-muted-foreground">
          Stay safe while traveling with real-time safety information. Where every second counts.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Globe className="mr-2 h-5 w-5 text-blue-500" />
              Travel Advisories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View current travel advisories and safety information for your destination
            </p>
            <Button variant="outline" className="w-full">
              Check Advisories
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Route className="mr-2 h-5 w-5 text-red-500" />
              AI-Powered Safe Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Let our AI find the safest routes to your destination. Where every second counts.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                document.getElementById('destination-input')?.focus();
                toast({
                  title: "AI Route Planning",
                  description: "Enter your destination below to find the safest route",
                });
              }}
            >
              Plan Route
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Shield className="mr-2 h-5 w-5 text-green-500" />
              Safety Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Prepare for your trip with our comprehensive safety checklist
            </p>
            <Button variant="outline" className="w-full">
              View Checklist
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="mr-2 h-5 w-5 text-blue-500" />
            AI-Powered Safe Route Planning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Our AI analyzes real-time threats, crime data, and environmental hazards to plan the safest route to your destination. Every second counts when traveling safely.
            </p>
            <div className="flex flex-wrap gap-2">
              <input
                id="destination-input"
                className="flex-1 min-w-[200px] px-3 py-2 border rounded-md"
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <Button 
                onClick={handlePlanRoute}
                disabled={planningRoute}
                className="relative"
              >
                {planningRoute && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  </span>
                )}
                <span className={planningRoute ? "opacity-0" : ""}>Find Safe Route</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelPage;
