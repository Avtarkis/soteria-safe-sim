
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket } from '@/types/support';
import { useNavigate } from 'react-router-dom';
import { TicketTable } from '@/components/admin/support/TicketTable';
import { TicketFilters } from '@/components/admin/support/TicketFilters';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

export const AdminSupportManagement = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        // Start with the basic query
        let query = supabase
          .from('support_tickets')
          .select('*');
        
        // Apply filters if needed
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        if (priorityFilter !== 'all') {
          query = query.eq('priority', priorityFilter);
        }

        if (categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter);
        }
          
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        
        // Get user emails 
        const userIds = Array.from(new Set((data || []).map(ticket => ticket.user_id)));
        
        let userEmails: Record<string, string> = {};
        if (userIds.length > 0) {
          // Use a custom RPC function or a direct query to get user information
          // For this example, let's use auth.users directly but in production,
          // we should set up a view or function to expose this safely
          
          // Note: In actual implementation, you would set up a profiles table
          // This is a simplified approach for development
          for (const userId of userIds) {
            const { data: userData } = await supabase.auth.admin.getUserById(userId);
            if (userData?.user) {
              userEmails[userId] = userData.user.email || 'Unknown';
            }
          }
        }
        
        // Transform the data to match our interface
        const transformedTickets: SupportTicket[] = (data || []).map(ticket => ({
          id: ticket.id,
          userId: ticket.user_id,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status as 'open' | 'in_progress' | 'resolved' | 'closed',
          priority: ticket.priority as 'low' | 'medium' | 'high' | 'urgent',
          category: ticket.category as 'technical' | 'billing' | 'account' | 'feature_request' | 'other',
          createdAt: ticket.created_at,
          updatedAt: ticket.updated_at,
          userEmail: userEmails[ticket.user_id] || 'Unknown'
        }));
        
        setTickets(transformedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast({ 
          title: "Failed to load tickets", 
          description: "Please try again later", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
    
    // Set up real-time listener for ticket updates
    const ticketChannel = supabase
      .channel('admin-ticket-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => {
          fetchTickets();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(ticketChannel);
    };
  }, [toast, statusFilter, priorityFilter, categoryFilter]);
  
  // Filter tickets based on search term
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.userEmail && ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesSearch;
  });
  
  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', ticketId);
        
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
            ticket_id: ticketId,
            is_admin: true,
            message: "A support agent has started working on your ticket. We'll respond as soon as possible."
          });
      }
      
      // If the status was just updated to resolved, add a system message
      if (newStatus === 'resolved') {
        await supabase
          .from('ticket_messages')
          .insert({
            ticket_id: ticketId,
            is_admin: true,
            message: "Your ticket has been resolved. If you're still experiencing issues, please let us know and we'll reopen the ticket."
          });
      }
      
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Update failed",
        description: "Failed to update ticket status",
        variant: "destructive"
      });
    }
  };
  
  const handleViewTicket = (ticketId: string) => {
    navigate(`/admin/support/ticket/${ticketId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Tickets Management</h1>
        <p className="text-muted-foreground">View and manage user support tickets</p>
      </div>
      
      <TicketFilters 
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        categoryFilter={categoryFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onPriorityFilterChange={setPriorityFilter}
        onCategoryFilterChange={setCategoryFilter}
      />
      
      <Card>
        <CardContent className="p-0">
          <TicketTable 
            tickets={filteredTickets} 
            onViewTicket={handleViewTicket}
            onUpdateStatus={handleUpdateStatus}
            loading={loading}
            searchTerm={searchTerm}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupportManagement;
