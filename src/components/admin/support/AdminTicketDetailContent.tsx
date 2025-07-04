
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket, TicketMessage } from '@/types/support';
import { AlertTriangle } from 'lucide-react';
import { TicketDetails } from '@/components/admin/support/TicketDetails';
import { ConversationPanel } from '@/components/admin/support/ConversationPanel';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserById } from '@/lib/auth';

interface AdminTicketDetailContentProps {
  ticketId: string;
}

const AdminTicketDetailContent = ({ ticketId }: AdminTicketDetailContentProps) => {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Consider it admin for testing in development
  const hasAdminAccess = isAdmin || import.meta.env.DEV;
  
  useEffect(() => {
    if (!ticketId) {
      setLoading(false);
      setError("No ticket ID provided");
      return;
    }
    
    if (!user || !hasAdminAccess) {
      setLoading(false);
      setError("You don't have permission to view this ticket");
      return;
    }
    
    const fetchTicketDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('id', ticketId)
          .maybeSingle();
          
        if (ticketError) {
          console.error('Error fetching ticket:', ticketError);
          setError("Failed to load ticket details");
          toast({
            title: "Error loading ticket",
            description: "Failed to load ticket details. Please try again later.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        if (!ticketData) {
          setError("The requested ticket does not exist");
          toast({
            title: "Ticket not found",
            description: "The requested ticket does not exist",
            variant: "destructive"
          });
          navigate('/admin/support');
          return;
        }
        
        // Get user email separately through auth admin API or user profile
        let userEmail = 'Unknown';
        
        try {
          const userData = await getUserById(ticketData.user_id);
          userEmail = userData?.email || 'Unknown';
        } catch (emailError) {
          console.error('Error fetching user email:', emailError);
          // Continue with unknown email
        }
        
        setTicket({
          id: ticketData.id,
          userId: ticketData.user_id,
          title: ticketData.title,
          description: ticketData.description,
          status: ticketData.status as 'open' | 'in_progress' | 'resolved' | 'closed',
          priority: ticketData.priority as 'low' | 'medium' | 'high' | 'urgent',
          category: ticketData.category as 'technical' | 'billing' | 'account' | 'feature_request' | 'other',
          createdAt: ticketData.created_at,
          updatedAt: ticketData.updated_at,
          userEmail
        });
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('ticket_messages')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });
          
        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          toast({
            title: "Error loading messages",
            description: "Failed to load ticket messages. Please try again later.",
            variant: "destructive"
          });
          // Continue execution - we can still show the ticket without messages
        } else {
          setMessages(messagesData ? messagesData.map(msg => ({
            id: msg.id,
            ticketId: msg.ticket_id,
            userId: msg.user_id || '',
            isAdmin: msg.is_admin,
            message: msg.message,
            attachmentUrl: msg.attachment_url,
            createdAt: msg.created_at
          })) : []);
        }
      } catch (error) {
        console.error('Error fetching ticket details:', error);
        setError("Failed to load ticket details");
        toast({
          title: "Error loading ticket",
          description: "Failed to load ticket details. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicketDetails();
    
    // Set up real-time listeners for messages and ticket updates
    if (user && hasAdminAccess) {
      const messagesChannel = supabase
        .channel('admin-ticket-messages')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${ticketId}` },
          payload => {
            const newMsg = payload.new as any;
            setMessages(current => [...current, {
              id: newMsg.id,
              ticketId: newMsg.ticket_id,
              userId: newMsg.user_id || '',
              isAdmin: newMsg.is_admin,
              message: newMsg.message,
              attachmentUrl: newMsg.attachment_url,
              createdAt: newMsg.created_at
            }]);
          }
        )
        .subscribe();
        
      const ticketChannel = supabase
        .channel('admin-ticket-updates')
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'support_tickets', filter: `id=eq.${ticketId}` },
          payload => {
            const updatedTicket = payload.new as any;
            setTicket(current => current ? {
              ...current,
              status: updatedTicket.status as 'open' | 'in_progress' | 'resolved' | 'closed',
              updatedAt: updatedTicket.updated_at
            } : null);
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(ticketChannel);
      };
    }
  }, [ticketId, user, hasAdminAccess, toast, navigate]);
  
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !user || !ticket) return;
    
    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          is_admin: true,
          message: message.trim()
        });
        
      if (error) throw error;
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };
  
  const handleUpdateStatus = async (newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    if (!ticket) return;
    
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);
        
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Ticket status changed to ${newStatus.replace('_', ' ')}`,
      });
      
      // Add system messages based on status change
      if (newStatus === 'in_progress') {
        await supabase
          .from('ticket_messages')
          .insert({
            ticket_id: ticket.id,
            is_admin: true,
            message: "A support agent has started working on your ticket. We'll respond as soon as possible.",
            user_id: user?.id
          });
      }
      
      if (newStatus === 'resolved') {
        await supabase
          .from('ticket_messages')
          .insert({
            ticket_id: ticket.id,
            is_admin: true,
            message: "Your ticket has been resolved. If you're still experiencing issues, please let us know and we'll reopen the ticket.",
            user_id: user?.id
          });
      }
      
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Update failed",
        description: "Failed to update ticket status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !ticket) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ticket Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || "The requested ticket does not exist"}
          </p>
          <Button onClick={() => navigate('/admin/support')}>
            Back to Support Management
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <TicketDetails 
        ticket={ticket}
        updatingStatus={updatingStatus}
        onUpdateStatus={handleUpdateStatus}
      />
      
      <ConversationPanel
        messages={messages}
        ticketStatus={ticket.status}
        userEmail={ticket.userEmail}
        sendingMessage={sendingMessage}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default AdminTicketDetailContent;
