
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket } from '@/types/support';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Check, 
  Clock, 
  HelpCircle, 
  LifeBuoy, 
  PlusCircle, 
  Settings 
} from 'lucide-react';
import CreateTicketForm from '@/components/support/CreateTicketForm';
import TicketsList from '@/components/support/TicketsList';
import SupportFaq from '@/components/support/SupportFaq';

const SupportPage = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize with empty array if user is not authenticated
    if (!user) {
      setTickets([]);
      setLoading(false);
      return;
    }
    
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching tickets:', error);
          throw error;
        }
        
        // Even if no data is returned, this is a valid state (no tickets yet)
        const transformedTickets: SupportTicket[] = data ? data.map(ticket => ({
          id: ticket.id,
          userId: ticket.user_id,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status as 'open' | 'in_progress' | 'resolved' | 'closed',
          priority: ticket.priority as 'low' | 'medium' | 'high' | 'urgent',
          category: ticket.category as 'technical' | 'billing' | 'account' | 'feature_request' | 'other',
          createdAt: ticket.created_at,
          updatedAt: ticket.updated_at
        })) : [];
        
        setTickets(transformedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast({ 
          title: "Failed to load support tickets", 
          description: "Please try again later", 
          variant: "destructive" 
        });
      } finally {
        // Always set loading to false, even on error
        setLoading(false);
      }
    };
    
    fetchTickets();
    
    // Set up real-time listener for ticket updates
    const ticketChannel = supabase
      .channel('support-ticket-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'support_tickets', filter: `user_id=eq.${user.id}` },
        () => {
          fetchTickets();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(ticketChannel);
    };
  }, [user, toast]);

  const handleViewTicket = (ticketId: string) => {
    navigate(`/support/ticket/${ticketId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'in_progress':
        return <Clock size={16} className="text-blue-500" />;
      case 'resolved':
        return <Check size={16} className="text-green-500" />;
      default:
        return <HelpCircle size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="container py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <LifeBuoy className="mr-2 h-8 w-8 text-primary" />
            Support Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Get help with your account, report issues, or request new features
          </p>
        </div>
        
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center"
        >
          {showCreateForm ? (
            <span>Cancel</span>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Support Ticket
            </>
          )}
        </Button>
      </div>
      
      {showCreateForm ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Support Ticket</CardTitle>
            <CardDescription>
              Provide details about the issue you're experiencing or feature you'd like to request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTicketForm onSuccess={() => setShowCreateForm(false)} />
          </CardContent>
        </Card>
      ) : null}
      
      <Tabs defaultValue="tickets">
        <TabsList className="mb-4">
          <TabsTrigger value="tickets" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center">
            <HelpCircle className="mr-2 h-4 w-4" />
            FAQ
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets">
          <TicketsList 
            tickets={tickets} 
            loading={loading}
            onViewTicket={handleViewTicket}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>
        
        <TabsContent value="faq">
          <SupportFaq />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportPage;
