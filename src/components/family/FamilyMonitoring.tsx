import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import FamilyMemberList from './FamilyMemberList';
import FamilyMemberDetails from './FamilyMemberDetails';
import useUserLocation from '@/hooks/useUserLocation';
import { FamilyMember, FamilyGroup } from '@/types/family';
import { supabase } from '@/integrations/supabase/client';

const FamilyMonitoring = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userLocation } = useUserLocation();

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const { data: familyGroups, error: groupsError } = await supabase
          .from('family_groups')
          .select('*');

        if (groupsError) throw groupsError;

        const { data: members, error: membersError } = await supabase
          .from('family_members')
          .select(`
            *,
            member_locations (
              location_name,
              location_type,
              coordinates,
              last_updated
            ),
            sharing_permissions (*)
          `)
          .in('family_group_id', familyGroups.map(g => g.id));

        if (membersError) throw membersError;

        const transformedMembers: FamilyMember[] = members.map(member => ({
          id: member.id,
          name: member.name,
          type: member.type,
          location: {
            name: member.member_locations?.[0]?.location_name || 'Unknown',
            type: member.member_locations?.[0]?.location_type || 'other',
            coordinates: member.member_locations?.[0]?.coordinates || [0, 0],
            lastUpdated: member.member_locations?.[0]?.last_updated || new Date().toISOString()
          },
          status: 'online',
          lastCheckIn: new Date().toISOString(),
          batteryLevel: 100,
          safeZones: []
        }));

        setMembers(transformedMembers);
        if (transformedMembers.length > 0 && !selectedMemberId) {
          setSelectedMemberId(transformedMembers[0].id);
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

    const channel = supabase
      .channel('family-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'member_locations' },
        (payload) => {
          setMembers(currentMembers => {
            return currentMembers.map(member => {
              if (member.id === payload.new.member_id) {
                return {
                  ...member,
                  location: {
                    name: payload.new.location_name,
                    type: payload.new.location_type,
                    coordinates: payload.new.coordinates,
                    lastUpdated: payload.new.last_updated
                  }
                };
              }
              return member;
            });
          });
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, userLocation]);

  const requestCheckIn = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    toast({
      title: 'Check-in Requested',
      description: `A check-in request has been sent to ${member.name}.`,
    });
  };

  const callEmergency = async (memberId: string) => {
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
