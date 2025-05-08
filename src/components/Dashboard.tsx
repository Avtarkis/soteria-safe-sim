import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import useAIMonitoring from '@/hooks/use-ai-monitoring';
import { 
  MapPin, AlertTriangle, Shield, Users, BarChart3, Globe, Lock, 
  Zap, ChevronRight, ExternalLink 
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  DashboardHeader, 
  SecurityMetricsSection,
  AlertsAndFamilySection,
  QuickActionsSection 
} from './dashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { detections } = useAIMonitoring();

  // Calculate route to safe destination
  const handleRouteClick = (destination: string) => {
    toast({
      title: `Safe Route to ${destination}`,
      description: `Calculating the safest route to your ${destination.toLowerCase()} location...`,
    });
    
    // Simulate route calculation
    setTimeout(() => {
      toast({
        title: `Route Found`,
        description: `The safest route to your ${destination.toLowerCase()} has been calculated. Redirecting to map view...`,
      });
      
      // Navigate to map with predefined destination
      navigate(`/map?destination=${destination.toLowerCase()}`);
    }, 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-fade-in">
      <DashboardHeader />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Threat Map</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Family</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <SecurityMetricsSection />
          <AlertsAndFamilySection detections={detections as Detection[]} />
          <QuickActionsSection handleRouteClick={handleRouteClick} />
        </TabsContent>
        
        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Threat Map
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-muted-foreground">
                View real-time threats and safety information on our interactive map.
              </p>
              <Button onClick={() => navigate('/map')} className="mx-auto">
                Open Threat Map
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Safety Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-muted-foreground">
                View and manage your safety alerts and notifications.
              </p>
              <Button onClick={() => navigate('/alerts')} className="mx-auto">
                View All Alerts
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="family" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-muted-foreground">
                Monitor and manage the safety of your family members.
              </p>
              <Button onClick={() => navigate('/family')} className="mx-auto">
                Family Monitoring
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Emergency
            </CardTitle>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/emergency">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access emergency features and SOS functionality.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Travel
            </CardTitle>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/travel">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Plan safe travel routes and review travel advisories.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Cyber
            </CardTitle>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/cyber">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Check cybersecurity threats and protect your digital assets.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
