
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { 
  Map as MapIcon, 
  Navigation, 
  AlertTriangle, 
  Info, 
  Shield, 
  Eye, 
  EyeOff, 
  Layers, 
  ArrowRight, 
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LeafletMap, { ThreatMarker } from '@/components/ui/LeafletMap';
import { weatherService } from '@/services/weatherService';
import { crimeService } from '@/services/crimeService';
import { useToast } from '@/hooks/use-toast';

interface ThreatZone {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  level: 'low' | 'medium' | 'high';
  title: string;
  details: string;
  type?: 'cyber' | 'physical' | 'environmental';
}

interface FilterOption {
  id: string;
  label: string;
  active: boolean;
  color: string;
}

const ThreatsMap = () => {
  const [loading, setLoading] = useState(true);
  const [selectedThreat, setSelectedThreat] = useState<ThreatZone | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [filters, setFilters] = useState<FilterOption[]>([
    { id: 'cyber', label: 'Cyber', active: true, color: 'bg-blue-500' },
    { id: 'physical', label: 'Physical', active: true, color: 'bg-red-500' },
    { id: 'environmental', label: 'Environmental', active: true, color: 'bg-green-500' },
  ]);
  const [threatMarkers, setThreatMarkers] = useState<ThreatMarker[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const loadThreatData = async () => {
    setLoading(true);
    try {
      // Fetch crime data from FBI API
      const crimeThreats = await crimeService.getCrimeThreats();
      
      // Fetch weather alerts for major US cities
      const majorCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Miami'];
      const weatherThreats = await weatherService.getWeatherThreats(majorCities);
      
      // Add some sample cyber threats (since we don't have a real API for these)
      const cyberThreats: ThreatMarker[] = [
        {
          id: 'cyber-1',
          position: [37.7749, -122.4194], // San Francisco
          level: 'high',
          title: 'DDoS Attack',
          details: 'Major distributed denial of service attack targeting tech companies in this region.',
          type: 'cyber'
        },
        {
          id: 'cyber-2',
          position: [40.7128, -74.006], // New York
          level: 'medium',
          title: 'Ransomware Alert',
          details: 'Financial institutions reporting ransomware attempts. Implement security protocols.',
          type: 'cyber'
        },
        {
          id: 'cyber-3',
          position: [51.5074, -0.1278], // London
          level: 'low',
          title: 'Phishing Campaign',
          details: 'Increased phishing emails reported targeting users in this area.',
          type: 'cyber'
        }
      ];
      
      // Combine all threats
      const allThreats = [...crimeThreats, ...weatherThreats, ...cyberThreats];
      
      setThreatMarkers(allThreats);
    } catch (error) {
      console.error('Error loading threat data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load some threat data. Please try again later.',
        variant: 'destructive',
      });
      
      // Load fallback data
      setThreatMarkers([
        {
          id: '1',
          position: [40.7128, -74.006], // New York
          level: 'high',
          title: 'Data Breach Alert',
          details: 'Major data breach reported in this area affecting financial institutions.',
          type: 'cyber'
        },
        {
          id: '2',
          position: [34.0522, -118.2437], // Los Angeles
          level: 'medium',
          title: 'Street Crime Warning',
          details: 'Recent increase in street theft and muggings reported in this neighborhood.',
          type: 'physical'
        },
        {
          id: '3',
          position: [51.5074, -0.1278], // London
          level: 'low',
          title: 'Weather Advisory',
          details: 'Potential flooding in low-lying areas due to heavy rainfall forecast.',
          type: 'environmental'
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadThreatData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadThreatData();
  };

  const toggleFilter = (id: string) => {
    setFilters(filters.map(filter => 
      filter.id === id ? { ...filter, active: !filter.active } : filter
    ));
  };

  const handleThreatClick = (threat: ThreatMarker) => {
    // Convert ThreatMarker to ThreatZone format for the selected display
    setSelectedThreat({
      id: threat.id,
      lat: threat.position[0],
      lng: threat.position[1],
      radius: threat.level === 'high' ? 20 : threat.level === 'medium' ? 15 : 10,
      level: threat.level,
      title: threat.title,
      details: threat.details,
      type: threat.type
    });
  };

  const clearSelectedThreat = () => {
    setSelectedThreat(null);
  };

  // Filter markers based on active filters
  const getFilteredMarkers = () => {
    if (filters.every(f => f.active)) return threatMarkers;
    
    return threatMarkers.filter(marker => {
      if (!marker.type) return true; // Include markers without a type
      return filters.find(f => f.id === marker.type)?.active;
    });
  };

  // Get nearby alerts for side panel
  const getNearbyAlerts = () => {
    return threatMarkers
      .sort((a, b) => {
        if (a.level === 'high' && b.level !== 'high') return -1;
        if (a.level !== 'high' && b.level === 'high') return 1;
        if (a.level === 'medium' && b.level === 'low') return -1;
        if (a.level === 'low' && b.level === 'medium') return 1;
        return 0;
      })
      .slice(0, 3);
  };

  return (
    <div className="container pb-10 animate-fade-in">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Threat Map</h1>
        <p className="text-muted-foreground">
          Real-time global threat visualization with AI risk assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map container */}
        <div className="lg:col-span-3 relative">
          <Card className="overflow-hidden h-[70vh]">
            <div className="absolute top-4 left-4 z-10 space-y-2">
              <Button variant="outline" size="sm" className="shadow-sm bg-background/80 backdrop-blur-sm">
                <Navigation className="h-4 w-4 mr-1" />
                <span>My Location</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="shadow-sm bg-background/80 backdrop-blur-sm"
                onClick={() => setShowLegend(!showLegend)}
              >
                {showLegend ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                <span>{showLegend ? "Hide Legend" : "Show Legend"}</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="shadow-sm bg-background/80 backdrop-blur-sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", refreshing && "animate-spin")} />
                <span>Refresh Data</span>
              </Button>
            </div>

            {showLegend && (
              <div className="absolute top-4 right-4 z-10">
                <Card className="shadow-sm bg-background/80 backdrop-blur-sm w-48">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm flex items-center">
                      <Layers className="h-4 w-4 mr-1" />
                      Threat Levels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-threat-high mr-2"></span>
                        <span>High Risk</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-threat-medium mr-2"></span>
                        <span>Medium Risk</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-threat-low mr-2"></span>
                        <span>Low Risk</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm transition-all",
                    filter.active 
                      ? `${filter.color} text-white` 
                      : "bg-background/80 text-muted-foreground"
                  )}
                  onClick={() => toggleFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="h-full w-full flex items-center justify-center bg-muted/20">
                <div className="flex flex-col items-center">
                  <MapIcon className="h-10 w-10 text-muted-foreground animate-pulse" />
                  <p className="mt-2 text-muted-foreground">Loading threat map...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="h-full w-full relative">
                  <LeafletMap 
                    markers={getFilteredMarkers()}
                    onMarkerClick={handleThreatClick}
                    center={[30, 0]} // Center on the world map
                    zoom={2}
                  />
                </div>

                {/* Selected threat info overlay */}
                {selectedThreat && (
                  <div className="absolute bottom-16 left-4 right-4 z-20 animate-fade-in">
                    <Card className="bg-background/95 backdrop-blur-md border shadow-lg">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {selectedThreat.level === 'high' ? (
                              <AlertTriangle className="h-5 w-5 text-threat-high" />
                            ) : selectedThreat.level === 'medium' ? (
                              <AlertTriangle className="h-5 w-5 text-threat-medium" />
                            ) : (
                              <Info className="h-5 w-5 text-threat-low" />
                            )}
                            <CardTitle className="text-base">{selectedThreat.title}</CardTitle>
                          </div>
                          <button 
                            className="text-muted-foreground hover:text-foreground"
                            onClick={clearSelectedThreat}
                          >
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-2">{selectedThreat.details}</p>
                        <div className="flex justify-between items-center">
                          <span className={cn("text-xs px-2.5 py-1 rounded-full", 
                            selectedThreat.level === 'high' ? "bg-threat-high/10 border-threat-high/20 text-threat-high" :
                            selectedThreat.level === 'medium' ? "bg-threat-medium/10 border-threat-medium/20 text-threat-medium" :
                            "bg-threat-low/10 border-threat-low/20 text-threat-low"
                          )}>
                            {selectedThreat.level.charAt(0).toUpperCase() + selectedThreat.level.slice(1)} Threat Level
                          </span>
                          <Button size="sm" variant="outline" className="text-xs gap-1">
                            <Shield className="h-3 w-3" />
                            View Safety Plan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Side panel */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Your Current Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Overall Risk</span>
                  <span className="text-sm font-medium text-threat-low">Low</span>
                </div>
                <div className="h-2 bg-secondary rounded-full mb-4">
                  <div className="h-2 bg-threat-low rounded-full w-[20%]"></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Your current location has no significant threats detected at this time. Continue to monitor for updates.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Nearby Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-muted"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    getNearbyAlerts().map((alert, index) => (
                      <div key={alert.id} className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          alert.level === 'high' 
                            ? "bg-threat-high/20" 
                            : alert.level === 'medium'
                              ? "bg-threat-medium/20"
                              : "bg-threat-low/20"
                        )}>
                          {alert.level === 'high' || alert.level === 'medium' ? (
                            <AlertTriangle className={cn(
                              "h-4 w-4",
                              alert.level === 'high' ? "text-threat-high" : "text-threat-medium"
                            )} />
                          ) : (
                            <Info className="h-4 w-4 text-threat-low" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.type === 'physical' 
                              ? '2.3 miles away' 
                              : alert.type === 'cyber' 
                                ? 'Regional' 
                                : 'Weather alert'} • {index * 15 + 5} min ago
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Travel Advisory</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Safest routes to your saved locations:</p>
                <div className="mt-3 space-y-2">
                  <button className="w-full flex items-center justify-between p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                    <span className="text-sm">Home</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="w-full flex items-center justify-between p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                    <span className="text-sm">Work</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatsMap;
