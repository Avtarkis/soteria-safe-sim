
import React from 'react';
import { Card, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Clock, Phone, Heart, MapPin } from 'lucide-react';
import { FamilyMember } from '@/types/family';
import FamilyMap from './FamilyMap';

interface FamilyMemberDetailsProps {
  member: FamilyMember;
  onRequestCheckIn: (memberId: string) => void;
  onEmergencyCall: (memberId: string) => void;
  familyMembers: FamilyMember[];
  userLocation: [number, number] | null;
}

const FamilyMemberDetails = ({ 
  member, 
  onRequestCheckIn, 
  onEmergencyCall, 
  familyMembers,
  userLocation 
}: FamilyMemberDetailsProps) => {
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

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-xl font-semibold">{member.name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {member.location.name}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onRequestCheckIn(member.id)}>
              <Clock className="h-4 w-4 mr-2" />
              Request Check-in
            </Button>
            <Button variant="destructive" onClick={() => onEmergencyCall(member.id)}>
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
                  selectedMember={member}
                  familyMembers={familyMembers}
                  userLocation={userLocation}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Location History</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{member.location.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(member.location.lastUpdated)}
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
                  {member.safeZones.map(zone => (
                    <div key={zone.id} className="border rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
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
                      <span className="text-xs">{member.batteryLevel}%</span>
                    </div>
                    <Progress value={member.batteryLevel} className="h-2" />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Last Check-in</span>
                    <span className="text-muted-foreground">
                      {formatTimeSince(member.lastCheckIn)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="health" className="py-4">
            {member.healthStatus ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  member.healthStatus.status === 'normal' ? 'border-green-200 bg-green-50' :
                  member.healthStatus.status === 'warning' ? 'border-amber-200 bg-amber-50' :
                  'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Heart className={`h-5 w-5 ${getHealthStatusColor(member.healthStatus.status)}`} />
                    <span className={`font-medium ${getHealthStatusColor(member.healthStatus.status)}`}>
                      {member.healthStatus.description || 'Health Status'}
                    </span>
                  </div>
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
  );
};

export default FamilyMemberDetails;
