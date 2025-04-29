
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket, TicketMessage } from '@/types/support';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  HelpCircle,
  MessageCircle,
  Paperclip,
  Send,
  XCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const AdminTicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Consider it admin for testing in development
  const hasAdminAccess = isAdmin || import.meta.env.DEV;
  
  useEffect(() => {
    if (!ticketId || !user || !hasAdminAccess) return;
    
    const fetchTicketDetails = async () => {
      setLoading(true);
      try {
        // Fetch ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .select('*, users:user_id (email)')
          .eq('id', ticketId)
          .single();
          
        if (ticketError) throw ticketError;
        
        if (!ticketData) {
          toast({
            title: "Ticket not found",
            description: "The requested ticket does not exist",
            variant: "destructive"
          });
          navigate('/admin/support');
          return;
        }
        
        setTicket({
          id: ticketData.id,
          userId: ticketData.user_id,
          title: ticketData.title,
          description: ticketData.description,
          status: ticketData.status,
          priority: ticketData.priority,
          category: ticketData.category,
          createdAt: ticketData.created_at,
          updatedAt: ticketData.updated_at,
          userEmail: ticketData.users?.email
        });
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('ticket_messages')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });
          
        if (messagesError) throw messagesError;
        
        setMessages(messagesData.map(msg => ({
          id: msg.id,
          ticketId: msg.ticket_id,
          userId: msg.user_id,
          isAdmin: msg.is_admin,
          message: msg.message,
          attachmentUrl: msg.attachment_url,
          createdAt: msg.created_at
        })));
      } catch (error) {
        console.error('Error fetching ticket details:', error);
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
    
    // Set up real-time listeners for messages
    const messagesChannel = supabase
      .channel('admin-ticket-messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${ticketId}` },
        payload => {
          const newMsg = payload.new as any;
          setMessages(current => [...current, {
            id: newMsg.id,
            ticketId: newMsg.ticket_id,
            userId: newMsg.user_id,
            isAdmin: newMsg.is_admin,
            message: newMsg.message,
            attachmentUrl: newMsg.attachment_url,
            createdAt: newMsg.created_at
          }]);
        }
      )
      .subscribe();
      
    // Set up real-time listeners for ticket updates
    const ticketChannel = supabase
      .channel('admin-ticket-updates')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'support_tickets', filter: `id=eq.${ticketId}` },
        payload => {
          const updatedTicket = payload.new as any;
          setTicket(current => current ? {
            ...current,
            status: updatedTicket.status,
            updatedAt: updatedTicket.updated_at
          } : null);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(ticketChannel);
    };
  }, [ticketId, user, hasAdminAccess, toast, navigate]);
  
  // Scroll to bottom of messages when new ones appear
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Redirect non-admin users
  if (!user || !hasAdminAccess) {
    return <Navigate to="/login" replace />;
  }
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !ticket) return;
    
    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          is_admin: true,
          message: newMessage.trim()
        });
        
      if (error) throw error;
      
      setNewMessage('');
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
  
  const handleUpdateStatus = async (newStatus: string) => {
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
      
      // If the status was just updated to in_progress, add a system message
      if (newStatus === 'in_progress') {
        await supabase
          .from('ticket_messages')
          .insert({
            ticket_id: ticket.id,
            is_admin: true,
            message: "A support agent has started working on your ticket. We'll respond as soon as possible.",
            user_id: user.id
          });
      }
      
      // If the status was just updated to resolved, add a system message
      if (newStatus === 'resolved') {
        await supabase
          .from('ticket_messages')
          .insert({
            ticket_id: ticket.id,
            is_admin: true,
            message: "Your ticket has been resolved. If you're still experiencing issues, please let us know and we'll reopen the ticket.",
            user_id: user.id
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return '';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return '';
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (!ticket) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ticket Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The requested ticket does not exist
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
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-1">{ticket.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <span>Ticket #{ticket.id.substring(0, 8)}</span>
                    <span>•</span>
                    <span>Created {format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span>From: {ticket.userEmail || 'Unknown user'}</span>
                  </div>
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                </Badge>
                
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
              {ticket.description}
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="text-sm text-muted-foreground">
              Category: <span className="font-medium">{ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1).replace('_', ' ')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Select
                value={ticket.status}
                onValueChange={handleUpdateStatus}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open" className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                    Open
                  </SelectItem>
                  <SelectItem value="in_progress" className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    In Progress
                  </SelectItem>
                  <SelectItem value="resolved" className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Resolved
                  </SelectItem>
                  <SelectItem value="closed" className="flex items-center">
                    <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                    Closed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Conversation
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pb-6">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No messages yet. Start the conversation by sending a message below.</p>
                </div>
              ) : (
                messages.map(message => (
                  <div key={message.id} className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex ${message.isAdmin ? 'flex-row-reverse' : 'flex-row'} gap-3 max-w-[80%]`}>
                      <Avatar className="h-8 w-8">
                        {!message.isAdmin ? (
                          <AvatarFallback>
                            {ticket.userEmail?.substring(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        ) : (
                          <>
                            <AvatarImage src="/logo.svg" alt="Support Agent" />
                            <AvatarFallback className="bg-primary text-primary-foreground">SA</AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      
                      <div>
                        <div className={`rounded-lg p-3 ${
                          message.isAdmin 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.message}</p>
                          {message.attachmentUrl && (
                            <div className="mt-2">
                              <a 
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm underline"
                              >
                                <Paperclip className="h-3 w-3 mr-1" />
                                Attachment
                              </a>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          {ticket.status !== 'closed' && (
            <>
              <Separator />
              <CardFooter className="pt-4">
                <div className="grid w-full gap-2">
                  <Textarea
                    placeholder="Type your response here..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendingMessage ? 'Sending...' : 'Send Response'}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminTicketDetailPage;
