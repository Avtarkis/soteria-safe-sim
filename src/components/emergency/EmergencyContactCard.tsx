
import React from 'react';
import { Phone, MessageSquare, UserCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface EmergencyContactCardProps {
  contact: EmergencyContact;
  index: number;
}

const EmergencyContactCard: React.FC<EmergencyContactCardProps> = ({ contact, index }) => {
  return (
    <Card 
      className="animate-fade-in" 
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{contact.name}</h3>
            <p className="text-xs text-muted-foreground">{contact.relationship}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="w-full gap-1">
            <Phone className="h-3 w-3" />
            <span className="text-xs">Call</span>
          </Button>
          <Button size="sm" variant="outline" className="w-full gap-1">
            <MessageSquare className="h-3 w-3" />
            <span className="text-xs">Message</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyContactCard;
