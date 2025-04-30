
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTicketDetailContent from '@/components/admin/support/AdminTicketDetailContent';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminTicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  if (!ticketId) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invalid Ticket</h2>
            <p className="text-muted-foreground mb-6">
              No ticket ID provided
            </p>
            <Button onClick={() => navigate('/admin/support')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Support Management
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/support')} 
          className="mb-2 hover:bg-transparent p-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Support Management
        </Button>
        
        <AdminTicketDetailContent ticketId={ticketId} />
      </div>
    </AdminLayout>
  );
};

export default AdminTicketDetailPage;
