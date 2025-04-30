
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import TicketDetailContent from '@/components/support/TicketDetailContent';

const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  if (!ticketId) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <h2 className="text-2xl font-bold mb-2">Invalid Ticket</h2>
            <p className="text-muted-foreground mb-6">
              No ticket ID provided
            </p>
            <Button onClick={() => navigate('/support')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Support
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/support')} 
        className="mb-6 hover:bg-transparent p-0"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Support
      </Button>
      
      <TicketDetailContent ticketId={ticketId} />
    </div>
  );
};

export default TicketDetailPage;
