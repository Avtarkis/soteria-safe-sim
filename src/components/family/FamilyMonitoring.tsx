import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import FamilyMemberList from './FamilyMemberList';
import FamilyMemberDetails from './FamilyMemberDetails';
import useUserLocation from '@/hooks/useUserLocation';
import { FamilyMember } from '@/types/family';

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

  // Request check-in
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
          <FamilyMemberList
            members={members}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
            loading={loading}
          />
        </div>

        <div className="md:col-span-2">
          {selectedMember ? (
            <FamilyMemberDetails
              member={selectedMember}
              onRequestCheckIn={requestCheckIn}
              onEmergencyCall={callEmergency}
              familyMembers={members}
              userLocation={userLocation}
            />
          ) : (
            <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
              <p className="text-muted-foreground">
                Select a family member to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyMonitoring;
