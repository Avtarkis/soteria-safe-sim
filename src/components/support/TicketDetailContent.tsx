import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket, TicketMessage } from '@/types/support';
import {
  AlertTriangle,
  Check,
  Clock,
  HelpCircle,
  MessageCircle,
  Paperclip,
  Send
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { getUserById } from '@/lib/auth';

interface TicketDetailContentProps {
  ticketId: string;
}

const TicketDetailContent = ({ ticketId }: TicketDetailContentProps) => {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with not found state if no ticketId or user
    if (!ticketId) {
      setLoading(false);
      setError("No ticket ID provided");
      return;
    }
    
    if (!user) {
      setLoading(false);
      setError("You must be logged in to view tickets");
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
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (ticketError) {
          console.error('Error fetching ticket:', ticketError);
          setError("Failed to load ticket details. Please try again later.");
          toast({
            title: "Error loading ticket",
            description: "Failed to load ticket details. Please try again later.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        if (!ticketData) {
          setError("The requested ticket does not exist or you don't have access to it");
          toast({
            title: "Ticket not found",
            description: "The requested ticket does not exist or you don't have access to it",
            variant: "destructive"
          });
          setLoading(false);
          return;
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
          updatedAt: ticketData.updated_at
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
        }
        
        setMessages(messagesData ? messagesData.map(msg => ({
          id: msg.id,
          ticketId: msg.ticket_id,
          userId: msg.user_id || '',
          isAdmin: msg.is_admin,
          message: msg.message,
          attachmentUrl: msg.attachment_url,
          createdAt: msg.created_at
        })) : []);
        
      } catch (error) {
        console.error('Error fetching ticket details:', error);
        setError("Failed to load ticket details. Please try again later.");
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
    if (user) {
      const messagesChannel = supabase
        .channel('ticket-messages')
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
        .channel('ticket-updates')
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
  }, [ticketId, user, toast, navigate]);
  
  // Scroll to bottom of messages when new ones appear
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !ticket) return;
    
    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          is_admin: false,
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
  
  const getStatusIcon = () => {
    if (!ticket) return null;
    
    switch (ticket.status) {
      case 'open':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getPriorityColor = () => {
    if (!ticket) return "";
    
    switch (ticket.priority) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // Ticket header component
  const TicketHeader = () => (
    ticket && (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{ticket.title}</CardTitle>
            <div className="flex items-center">
              {getStatusIcon()}
              <span className="ml-2 text-sm font-semibold">
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>ID: {ticket.id.substring(0, 8)}</span>
            <span>•</span>
            <span>Created: {format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
            <span>•</span>
            <Badge className={getPriorityColor()}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
            {ticket.description}
          </div>
        </CardContent>
      </Card>
    )
  );
  
  // Messages section component
  const MessagesSection = () => (
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
              <div key={message.id} className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex ${message.isAdmin ? 'flex-row' : 'flex-row-reverse'} gap-3 max-w-[80%]`}>
                  <Avatar className="h-8 w-8">
                    {message.isAdmin ? (
                      <>
                        <AvatarImage src="/logo.svg" alt="Support Agent" />
                        <AvatarFallback className="bg-primary text-primary-foreground">SA</AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback>
                        {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div>
                    <div className={`rounded-lg p-3 ${
                      message.isAdmin 
                        ? 'bg-muted' 
                        : 'bg-primary text-primary-foreground'
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
      
      {ticket && ticket.status !== 'closed' && (
        <>
          <Separator />
          <CardFooter className="pt-4">
            <div className="grid w-full gap-2">
              <Textarea
                placeholder="Type your message here..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="hidden sm:flex"
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach File
                </Button>
                
                <Input 
                  type="file"
                  className="hidden"
                  id="file-upload"
                />
                
                <Button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="sm:ml-auto"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
  
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
            {error || "The requested ticket does not exist or you don't have access to it"}
          </p>
          <Button onClick={() => navigate('/support')}>
            Back to Support
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <TicketHeader />
      <MessagesSection />
    </>
  );
};

export default TicketDetailContent;
