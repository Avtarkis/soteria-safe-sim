
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, Shield, AlertCircle, Route, Navigation, CheckCircle2, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TravelPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [destination, setDestination] = useState('');
  const [planningRoute, setPlanningRoute] = useState(false);
  const [activeTab, setActiveTab] = useState('route');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Parse query params for tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'advisories' || tab === 'checklist') {
      setActiveTab(tab);
    }
  }, [location]);

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

  // Toggle checklist item
  const toggleChecklist = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    toast({
      title: checkedItems[id] ? "Item Unchecked" : "Item Checked",
      description: "Updated safety checklist - every second counts when preparing for travel."
    });
  };

  // Safety checklist items
  const safetyChecklist = [
    { id: 'emergency-contacts', title: 'Emergency Contacts', description: 'Add local emergency numbers to your phone' },
    { id: 'embassy-info', title: 'Embassy Information', description: 'Save contact information for your country\'s embassy' },
    { id: 'medical-kit', title: 'Medical Kit', description: 'Pack a basic medical kit with essential supplies' },
    { id: 'important-docs', title: 'Important Documents', description: 'Make copies of passport and important documents' },
    { id: 'route-planning', title: 'Route Planning', description: 'Research and plan safe routes in advance' },
    { id: 'local-laws', title: 'Local Laws', description: 'Familiarize yourself with local laws and customs' },
    { id: 'emergency-plan', title: 'Emergency Plan', description: 'Create a plan for emergencies and share with family' },
    { id: 'safe-transport', title: 'Safe Transportation', description: 'Research safe transportation options at your destination' }
  ];

  // Current advisory information
  const currentAdvisories = [
    { region: 'Europe', level: 'Exercise caution', description: 'Heightened security measures in major cities', date: '2025-04-01' },
    { region: 'Southeast Asia', level: 'Exercise increased caution', description: 'Monsoon season with potential for flooding', date: '2025-04-05' },
    { region: 'Middle East', level: 'Reconsider travel', description: 'Political instability in certain areas', date: '2025-04-03' },
    { region: 'South America', level: 'Exercise normal precautions', description: 'Be aware of petty crime in tourist areas', date: '2025-04-02' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Travel Safety</h1>
        <p className="text-muted-foreground">
          Stay safe while traveling with real-time safety information. Where every second counts.
        </p>
      </header>

      <Tabs defaultValue="route" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="route">Route Planning</TabsTrigger>
          <TabsTrigger value="advisories">Travel Advisories</TabsTrigger>
          <TabsTrigger value="checklist">Safety Checklist</TabsTrigger>
        </TabsList>
        
        <TabsContent value="route" className="space-y-4 pt-4">
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
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('advisories')}
                >
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
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('checklist')}
                >
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
                
                {planningRoute && (
                  <p className="text-sm text-center animate-pulse">
                    Planning the safest route... where every second counts.
                  </p>
                )}
                
                {!planningRoute && destination && (
                  <div className="border rounded-md p-4 mt-4">
                    <h3 className="text-lg font-medium mb-2">Your Safe Route is Ready</h3>
                    <p className="text-sm mb-3">
                      AI has calculated the safest route to {destination}, avoiding high-risk areas.
                    </p>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm font-medium">Safety Metrics:</p>
                      <ul className="text-sm mt-1 space-y-1">
                        <li>• 87% safer than the standard route</li>
                        <li>• Avoids 4 high-risk areas</li>
                        <li>• Only 7 minutes longer than fastest route</li>
                        <li>• 24/7 monitoring for real-time threats</li>
                      </ul>
                      <p className="text-xs mt-2 italic">Where every second counts for your safety</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advisories" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                Current Travel Advisories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Stay informed with the latest travel advisories from around the world. Where every second counts when making travel decisions.
              </p>
              
              <div className="space-y-4">
                {currentAdvisories.map((advisory, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{advisory.region}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        advisory.level.includes('normal') ? 'bg-green-100 text-green-800' :
                        advisory.level.includes('caution') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {advisory.level}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{advisory.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">Updated: {advisory.date}</p>
                  </div>
                ))}
              </div>
              
              <Button className="mt-4 w-full">
                Get Personalized Advisory
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="checklist" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCheck className="mr-2 h-5 w-5 text-green-500" />
                Travel Safety Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Complete this checklist before traveling to ensure your safety. Where every second counts in emergency situations, being prepared is essential.
              </p>
              
              <div className="space-y-3">
                {safetyChecklist.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleChecklist(item.id)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      checkedItems[item.id] ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {checkedItems[item.id] ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${checkedItems[item.id] && 'line-through text-muted-foreground'}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm">
                  <strong>Safety Tip:</strong> Share your travel itinerary with a trusted friend or family member. Every second counts in an emergency.
                </p>
              </div>
              
              <Button className="mt-4 w-full">
                Download Printable Checklist
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TravelPage;
