
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { School, Heart, Briefcase, UserPlus } from 'lucide-react';
import { FamilyMember } from '@/types/family';
import { useNavigate } from 'react-router-dom';

interface FamilyMemberListProps {
  members: FamilyMember[];
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
  loading: boolean;
}

const FamilyMemberList = ({ members, selectedMemberId, onSelectMember, loading }: FamilyMemberListProps) => {
  const navigate = useNavigate();
  
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

  const handleAddMember = () => {
    navigate('/family/invite');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Family Members
          <Button variant="ghost" size="icon" onClick={handleAddMember}>
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
                onClick={() => onSelectMember(member.id)}
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
                    <div 
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                    />
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {member.location.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyMemberList;
