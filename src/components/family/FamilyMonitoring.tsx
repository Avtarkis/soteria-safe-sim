
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import FamilyMemberList from './FamilyMemberList';
import FamilyMemberDetails from './FamilyMemberDetails';
import useUserLocation from '@/hooks/useUserLocation';
import { FamilyMember } from '@/types/family';
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

        // Fetch all members with their location data
        const { data: membersData, error: membersError } = await supabase
          .from('family_members')
          .select(`
            id,
            type,
            user_id,
            family_group_id,
            created_at,
            member_locations (
              location_name,
              location_type,
              coordinates,
              last_updated
            ),
            sharing_permissions (*)
          `);

        if (membersError) throw membersError;

        // Transform the data to match our FamilyMember interface
        const transformedMembers: FamilyMember[] = membersData.map(member => {
          // Since we don't have a name field in the member table directly,
          // we'll use placeholder names based on member type
          const getMemberName = (type: string, id: string) => {
            const shortId = id.substring(0, 4);
            switch (type) {
              case 'child': return `Child ${shortId}`;
              case 'senior': return `Senior ${shortId}`;
              case 'adult': return `Adult ${shortId}`;
              default: return `Family Member ${shortId}`;
            }
          };
          
          // Ensure type is one of the allowed values in our FamilyMember interface
          const memberType: 'child' | 'adult' | 'senior' = 
            member.type === 'child' || member.type === 'senior' ? 
            member.type as 'child' | 'senior' : 'adult';
          
          // Safely extract location data with type checking
          const locationData = member.member_locations && member.member_locations[0] ? member.member_locations[0] : null;
          
          // Default coordinates if none are available
          const defaultCoords: [number, number] = userLocation || [37.7749, -122.4194];
          
          // Extract coordinates safely with proper typing
          let coordinates: [number, number];
          if (locationData && locationData.coordinates) {
            // Handle PostgreSQL point data type conversion
            const coords = locationData.coordinates;
            if (typeof coords === 'object' && 'x' in coords && 'y' in coords) {
              coordinates = [coords.x as number, coords.y as number];
            } else {
              coordinates = defaultCoords;
            }
          } else {
            coordinates = defaultCoords;
          }

          return {
            id: member.id,
            name: getMemberName(memberType, member.id),
            type: memberType,
            location: {
              name: locationData?.location_name || 'Unknown',
              type: (locationData?.location_type as 'home' | 'school' | 'work' | 'other') || 'other',
              coordinates: coordinates,
              lastUpdated: locationData?.last_updated || new Date().toISOString()
            },
            status: 'online',
            lastCheckIn: new Date().toISOString(),
            batteryLevel: Math.floor(Math.random() * 30) + 70, // Random battery between 70-100%
            safeZones: [
              {
                id: 'home-' + member.id,
                name: 'Home',
                type: 'home',
                status: 'inside'
              },
              {
                id: 'school-' + member.id,
                name: memberType === 'child' ? 'School' : memberType === 'adult' ? 'Work' : 'Healthcare',
                type: memberType === 'child' ? 'school' : memberType === 'adult' ? 'work' : 'other',
                status: 'outside'
              }
            ]
          };
        });

        // If we don't have any real data, generate placeholder data
        if (transformedMembers.length === 0) {
          const placeholderMembers = generatePlaceholderMembers();
          setMembers(placeholderMembers);
          
          if (placeholderMembers.length > 0) {
            setSelectedMemberId(placeholderMembers[0].id);
          }
        } else {
          setMembers(transformedMembers);
          
          if (transformedMembers.length > 0 && !selectedMemberId) {
            setSelectedMemberId(transformedMembers[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching family members:', error);
        
        // If there's an error, use placeholder data as fallback
        const placeholderMembers = generatePlaceholderMembers();
        setMembers(placeholderMembers);
        
        if (placeholderMembers.length > 0 && !selectedMemberId) {
          setSelectedMemberId(placeholderMembers[0].id);
        }
        
        toast({
          title: 'Error',
          description: 'Failed to load family members. Using placeholder data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyMembers();

    // Set up real-time listener for location updates
    const channel = supabase
      .channel('family-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'member_locations' },
        (payload) => {
          if (!payload.new) return;
          
          setMembers(currentMembers => {
            return currentMembers.map(member => {
              // Check if this update is for this member
              if (member.id === payload.new.member_id) {
                // Safely extract new coordinates with proper typing
                let newCoords: [number, number] = member.location.coordinates;
                
                if (payload.new.coordinates) {
                  // Handle PostgreSQL point data type
                  const coords = payload.new.coordinates;
                  if (typeof coords === 'object' && 'x' in coords && 'y' in coords) {
                    newCoords = [coords.x as number, coords.y as number];
                  }
                }
                
                return {
                  ...member,
                  location: {
                    name: payload.new.location_name || member.location.name,
                    type: (payload.new.location_type as 'home' | 'school' | 'work' | 'other') || member.location.type,
                    coordinates: newCoords,
                    lastUpdated: payload.new.last_updated || member.location.lastUpdated
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
  }, [toast, userLocation, selectedMemberId]);

  // Generate placeholder family members for demo purposes
  const generatePlaceholderMembers = (): FamilyMember[] => {
    return [
      {
        id: '1',
        name: 'Emma (Child)',
        type: 'child',
        location: {
          name: 'School',
          type: 'school',
          coordinates: userLocation || [37.7749, -122.4194],
          lastUpdated: new Date().toISOString()
        },
        status: 'online',
        lastCheckIn: new Date().toISOString(),
        batteryLevel: 85,
        safeZones: [
          { id: 'home-1', name: 'Home', type: 'home', status: 'outside' },
          { id: 'school-1', name: 'School', type: 'school', status: 'inside' }
        ],
        healthStatus: {
          status: 'normal',
          description: 'Healthy'
        }
      },
      {
        id: '2',
        name: 'Mike (Dad)',
        type: 'adult',
        location: {
          name: 'Work',
          type: 'work',
          coordinates: userLocation ? [userLocation[0] + 0.01, userLocation[1] - 0.01] : [37.78, -122.41],
          lastUpdated: new Date().toISOString()
        },
        status: 'online',
        lastCheckIn: new Date(Date.now() - 15 * 60000).toISOString(), // 15 min ago
        batteryLevel: 65,
        safeZones: [
          { id: 'home-2', name: 'Home', type: 'home', status: 'outside' },
          { id: 'work-2', name: 'Office', type: 'work', status: 'inside' }
        ]
      },
      {
        id: '3',
        name: 'Sarah (Mom)',
        type: 'adult',
        location: {
          name: 'Home',
          type: 'home',
          coordinates: userLocation ? [userLocation[0] - 0.005, userLocation[1] + 0.005] : [37.77, -122.42],
          lastUpdated: new Date().toISOString()
        },
        status: 'online',
        lastCheckIn: new Date().toISOString(),
        batteryLevel: 92,
        safeZones: [
          { id: 'home-3', name: 'Home', type: 'home', status: 'inside' },
          { id: 'work-3', name: 'Clinic', type: 'work', status: 'outside' }
        ]
      },
      {
        id: '4',
        name: 'Grandpa Joe',
        type: 'senior',
        location: {
          name: 'Doctor\'s Office',
          type: 'other',
          coordinates: userLocation ? [userLocation[0] - 0.02, userLocation[1] - 0.01] : [37.76, -122.43],
          lastUpdated: new Date().toISOString()
        },
        status: 'offline',
        lastCheckIn: new Date(Date.now() - 45 * 60000).toISOString(), // 45 min ago
        batteryLevel: 38,
        safeZones: [
          { id: 'home-4', name: 'Home', type: 'home', status: 'outside' },
          { id: 'hospital-4', name: 'Hospital', type: 'other', status: 'inside' }
        ],
        healthStatus: {
          status: 'warning',
          description: 'Elevated blood pressure'
        }
      }
    ];
  };

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
