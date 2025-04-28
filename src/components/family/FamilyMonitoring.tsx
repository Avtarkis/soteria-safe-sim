
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, School, Briefcase, Phone, UserPlus, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import FamilyMap from './FamilyMap';
import useUserLocation from '@/hooks/useUserLocation';

interface FamilyMember {
  id: string;
  name: string;
  type: 'child' | 'adult' | 'senior';
  location: {
    name: string;
    type: 'home' | 'school' | 'work' | 'other';
    coordinates: [number, number];
    lastUpdated: string;
  };
  status: 'online' | 'offline' | 'emergency';
  lastCheckIn: string;
  batteryLevel: number;
  safeZones: {
    id: string;
    name: string;
    type: 'home' | 'school' | 'work' | 'other';
    status: 'inside' | 'outside';
  }[];
  healthStatus?: {
    status: 'normal' | 'warning' | 'critical';
    description?: string;
  };
}

const FamilyMonitoring = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userLocation } = useUserLocation();

  // Load family members
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      setLoading(true);
      try {
        // In a real app, this would come from an API
        // We're using dynamic coordinates based on user's location or defaults
        const baseCoords: [number, number] = userLocation || [34.052235, -118.243683];
        
        const mockMembers: FamilyMember[] = [
          {
            id: '1',
            name: 'Sarah',
            type: 'child',
            location: {
              name: 'Lincoln High School',
              type: 'school',
              coordinates: [
                baseCoords[0] + 0.01, 
                baseCoords[1] - 0.005
              ],
              lastUpdated: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            },
            status: 'online',
            lastCheckIn: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            batteryLevel: 78,
            safeZones: [
              { id: '1', name: 'Home', type: 'home', status: 'outside' },
              { id: '2', name: 'School', type: 'school', status: 'inside' },
              { id: '3', name: 'Grandparents', type: 'other', status: 'outside' },
            ],
            healthStatus: {
              status: 'normal',
              description: 'All vital signs normal',
            },
          },
          {
            id: '2',
            name: 'John',
            type: 'adult',
            location: {
              name: 'Downtown Office',
              type: 'work',
              coordinates: [
                baseCoords[0] - 0.005, 
                baseCoords[1] + 0.01
              ],
              lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            },
            status: 'online',
            lastCheckIn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            batteryLevel: 45,
            safeZones: [
              { id: '1', name: 'Home', type: 'home', status: 'outside' },
              { id: '4', name: 'Office', type: 'work', status: 'inside' },
            ],
          },
          {
            id: '3',
            name: 'Grandma',
            type: 'senior',
            location: {
              name: 'Home',
              type: 'home',
              coordinates: [
                baseCoords[0] + 0.008, 
                baseCoords[1] + 0.007
              ],
              lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            status: 'online',
            lastCheckIn: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            batteryLevel: 92,
            safeZones: [
              { id: '5', name: 'Home', type: 'home', status: 'inside' },
              { id: '6', name: 'Community Center', type: 'other', status: 'outside' },
            ],
            healthStatus: {
              status: 'warning',
              description: 'Slightly elevated heart rate, monitoring',
            },
          },
        ];

        setMembers(mockMembers);
        if (mockMembers.length > 0) {
          setSelectedMemberId(mockMembers[0].id);
        }
      } catch (error) {
        console.error('Error fetching family members:', error);
        toast({
          title: 'Error',
          description: 'Failed to load family members. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyMembers();
  }, [toast, userLocation]);

  // Send check-in request
  const requestCheckIn = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    toast({
      title: 'Check-in Requested',
      description: `A check-in request has been sent to ${member.name}.`,
    });
  };

  // Make emergency call
  const callEmergency = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    toast({
      title: 'Emergency Call',
      description: `Initiating emergency call to ${member.name}.`,
      variant: 'destructive',
    });
  };

  // Utility functions
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeSince = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'school':
        return <School className="h-4 w-4" />;
      case 'work':
        return <Briefcase className="h-4 w-4" />;
      case 'home':
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'emergency':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-500';
      case 'warning':
        return 'text-amber-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);

  return (
    <div className="container pb-10 animate-fade-in">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Family Monitoring</h1>
        <p className="text-muted-foreground">
          Keep track of your family members' locations and safety status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                Family Members
                <Button variant="ghost" size="icon">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-4 text-center text-muted-foreground">Loading family members...</div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${
                        member.id === selectedMemberId ? 'bg-secondary' : 'hover:bg-secondary/50'
                      }`}
                      onClick={() => setSelectedMemberId(member.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {member.type === 'child' ? (
                              <School className="h-5 w-5 text-primary" />
                            ) : member.type === 'senior' ? (
                              <Heart className="h-5 w-5 text-primary" />
                            ) : (
                              <Briefcase className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}></div>
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {getLocationIcon(member.location.type)}
                            {member.location.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeSince(member.location.lastUpdated)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedMember ? (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        {selectedMember.type === 'child' ? (
                          <School className="h-6 w-6 text-primary" />
                        ) : selectedMember.type === 'senior' ? (
                          <Heart className="h-6 w-6 text-primary" />
                        ) : (
                          <Briefcase className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="text-xl font-semibold">{selectedMember.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          {getLocationIcon(selectedMember.location.type)}
                          {selectedMember.location.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => requestCheckIn(selectedMember.id)}>
                        <Clock className="h-4 w-4 mr-2" />
                        Request Check-in
                      </Button>
                      <Button variant="destructive" onClick={() => callEmergency(selectedMember.id)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="location">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="location">Location</TabsTrigger>
                      <TabsTrigger value="safety">Safety</TabsTrigger>
                      <TabsTrigger value="health">Health</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="location" className="py-4">
                      <div className="space-y-4">
                        <div className="rounded-lg bg-muted h-[200px] overflow-hidden relative">
                          <FamilyMap 
                            selectedMember={selectedMember} 
                            familyMembers={members}
                            userLocation={userLocation}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Location History</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                {getLocationIcon(selectedMember.location.type)}
                                <span>{selectedMember.location.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(selectedMember.location.lastUpdated)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>En route to {selectedMember.location.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(new Date(new Date(selectedMember.location.lastUpdated).getTime() - 30 * 60 * 1000).toISOString())}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>Home</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(new Date(new Date(selectedMember.location.lastUpdated).getTime() - 2 * 60 * 60 * 1000).toISOString())}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="safety" className="py-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Safe Zones</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {selectedMember.safeZones.map(zone => (
                              <div key={zone.id} className="border rounded-lg p-3 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  {getLocationIcon(zone.type)}
                                  <span>{zone.name}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  zone.status === 'inside' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {zone.status === 'inside' ? 'Inside' : 'Outside'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Device Status</h3>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs">Battery</span>
                                <span className="text-xs">{selectedMember.batteryLevel}%</span>
                              </div>
                              <Progress value={selectedMember.batteryLevel} className="h-2" />
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span>Last Check-in</span>
                              <span className="text-muted-foreground">
                                {formatTimeSince(selectedMember.lastCheckIn)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span>Device Status</span>
                              <span className="text-muted-foreground capitalize">
                                {selectedMember.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="health" className="py-4">
                      {selectedMember.healthStatus ? (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-lg border ${
                            selectedMember.healthStatus.status === 'normal' ? 'border-green-200 bg-green-50' :
                            selectedMember.healthStatus.status === 'warning' ? 'border-amber-200 bg-amber-50' :
                            'border-red-200 bg-red-50'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Heart className={`h-5 w-5 ${getHealthStatusColor(selectedMember.healthStatus.status)}`} />
                              <span className={`font-medium ${getHealthStatusColor(selectedMember.healthStatus.status)}`}>
                                {selectedMember.healthStatus.description || 'Health Status'}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Vital Signs</h3>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs">Heart Rate</span>
                                  <span className="text-xs">72 bpm</span>
                                </div>
                                <Progress value={72} max={120} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs">Activity Level</span>
                                  <span className="text-xs">Moderate</span>
                                </div>
                                <Progress value={60} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs">Sleep Quality</span>
                                  <span className="text-xs">Good</span>
                                </div>
                                <Progress value={75} className="h-2" />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Health Alerts</h3>
                            {selectedMember.healthStatus.status !== 'normal' ? (
                              <div className="text-sm border rounded-lg p-3">
                                <div className="font-medium">
                                  {selectedMember.healthStatus.description}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Detected 45 minutes ago
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                No health alerts at this time.
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p>Health monitoring not enabled for this family member.</p>
                          <Button variant="outline" className="mt-4">
                            Enable Health Monitoring
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Select a family member or add a new one to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyMonitoring;
