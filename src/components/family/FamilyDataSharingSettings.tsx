
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Share2, 
  Shield, 
  Clock, 
  Heart, 
  Smartphone, 
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FamilyMemberSharingProps {
  id: string;
  name: string;
  type: 'child' | 'adult' | 'senior';
  deviceName: string;
  connected: boolean;
  sharesLocation: boolean;
  sharesHealth: boolean;
  sharesSafety: boolean;
}

const FamilyDataSharingSettings = () => {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberSharingProps[]>([
    {
      id: '1',
      name: 'Sarah',
      type: 'child',
      deviceName: 'Sarah\'s iPhone',
      connected: true,
      sharesLocation: true,
      sharesHealth: true,
      sharesSafety: true
    },
    {
      id: '2',
      name: 'John',
      type: 'adult',
      deviceName: 'John\'s Pixel',
      connected: true,
      sharesLocation: true,
      sharesHealth: false,
      sharesSafety: true
    },
    {
      id: '3',
      name: 'Grandma',
      type: 'senior',
      deviceName: 'Grandma\'s iPad',
      connected: true,
      sharesLocation: true,
      sharesHealth: true,
      sharesSafety: true
    }
  ]);

  const handleToggleSetting = (memberId: string, setting: 'sharesLocation' | 'sharesHealth' | 'sharesSafety') => {
    setFamilyMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, [setting]: !member[setting] }
          : member
      )
    );
    
    // In a real app, this would update settings on the server
    toast({
      title: "Settings Updated",
      description: "Family member sharing preferences have been saved."
    });
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Please enter an email",
        description: "Enter an email address to invite a family member.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send an invitation
    toast({
      title: "Invitation Sent",
      description: `An invitation has been sent to ${inviteEmail}.`,
    });
    setInviteEmail('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Family Data Sharing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Invite Family Member</h3>
          <p className="text-sm text-muted-foreground">
            Once they install Soteria Safety App, they will be able to share their location and other safety information.
          </p>
          <div className="flex gap-2 mt-2">
            <Input 
              placeholder="Email address" 
              value={inviteEmail} 
              onChange={(e) => setInviteEmail(e.target.value)} 
              className="flex-1"
            />
            <Button onClick={handleInvite}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Connected Family Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage what information is shared between family members.
          </p>
          
          <div className="space-y-4 mt-3">
            {familyMembers.map((member) => (
              <div key={member.id} className="border rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      {member.type === 'child' ? (
                        <Smartphone className="h-5 w-5 text-primary" />
                      ) : member.type === 'senior' ? (
                        <Heart className="h-5 w-5 text-primary" />
                      ) : (
                        <Shield className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.deviceName}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    member.connected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {member.connected ? 'Connected' : 'Pending'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div 
                    className={`flex items-center justify-between p-2 rounded border ${
                      member.sharesLocation ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <MapPin className={`h-4 w-4 mr-2 ${member.sharesLocation ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className="text-sm">Location</span>
                    </div>
                    <Toggle 
                      pressed={member.sharesLocation} 
                      onPressedChange={() => handleToggleSetting(member.id, 'sharesLocation')}
                    />
                  </div>
                  
                  <div 
                    className={`flex items-center justify-between p-2 rounded border ${
                      member.sharesHealth ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <Heart className={`h-4 w-4 mr-2 ${member.sharesHealth ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm">Health</span>
                    </div>
                    <Toggle 
                      pressed={member.sharesHealth} 
                      onPressedChange={() => handleToggleSetting(member.id, 'sharesHealth')}
                    />
                  </div>
                  
                  <div 
                    className={`flex items-center justify-between p-2 rounded border ${
                      member.sharesSafety ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <AlertCircle className={`h-4 w-4 mr-2 ${member.sharesSafety ? 'text-orange-500' : 'text-gray-400'}`} />
                      <span className="text-sm">Safety</span>
                    </div>
                    <Toggle 
                      pressed={member.sharesSafety} 
                      onPressedChange={() => handleToggleSetting(member.id, 'sharesSafety')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
          <h3 className="text-sm font-medium flex items-center">
            <Shield className="h-4 w-4 mr-2 text-blue-500" />
            About Family Data Sharing
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Each family member must install the Soteria Safety App on their device and accept your invitation.
            Data is shared securely and privately between family members' devices using end-to-end encryption.
            You can control exactly what information is shared at any time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyDataSharingSettings;
