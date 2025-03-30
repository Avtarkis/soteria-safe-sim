
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmergencyContactCard, { EmergencyContact } from './EmergencyContactCard';

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ contacts }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Emergency Contacts</h2>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          <span>Add Contact</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {contacts.map((contact, index) => (
          <EmergencyContactCard 
            key={index} 
            contact={contact} 
            index={index} 
          />
        ))}
      </div>
    </div>
  );
};

export default EmergencyContacts;
