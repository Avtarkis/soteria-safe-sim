
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket } from '@/types/support';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export const AdminSupportManagement = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        // Start with the basic query
        const { data, error } = await supabase
          .from('support_tickets')
          .select(`
            *,
            users:user_id (email)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
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
          // Add the user email from the joined data
          userEmail: ticket.users?.email || 'Unknown'
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
  }, [toast, statusFilter, priorityFilter]);
  
  // Filter tickets based on search term and other filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.userEmail && ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      
    return matchesSearch && matchesPriority && matchesStatus;
  });
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'in_progress':
        return <Clock size={16} className="text-blue-500" />;
      case 'resolved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'closed':
        return <XCircle size={16} className="text-gray-500" />;
      default:
        return null;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    let color = '';
    switch (priority) {
      case 'urgent':
        color = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        break;
      case 'high':
        color = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
        break;
      case 'medium':
        color = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        break;
      case 'low':
        color = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        break;
      default:
        color = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
    
    return (
      <Badge className={color}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'technical':
        return 'Technical Issue';
      case 'billing':
        return 'Billing';
      case 'account':
        return 'Account';
      case 'feature_request':
        return 'Feature Request';
      case 'other':
        return 'Other';
      default:
        return category;
    }
  };
  
  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
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
            message: "A support agent has started working on your ticket. We'll respond as soon as possible.",
            user_id: null // System message
          });
      }
      
      // If the status was just updated to resolved, add a system message
      if (newStatus === 'resolved') {
        await supabase
          .from('ticket_messages')
          .insert({
            ticket_id: ticketId,
            is_admin: true,
            message: "Your ticket has been resolved. If you're still experiencing issues, please let us know and we'll reopen the ticket.",
            user_id: null // System message
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
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tickets..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="group">
                      <TableCell className="font-mono text-xs">{ticket.id.substring(0, 8)}</TableCell>
                      <TableCell>{ticket.userEmail || 'Unknown'}</TableCell>
                      <TableCell className="font-medium">{ticket.title}</TableCell>
                      <TableCell>{getCategoryLabel(ticket.category)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                          <span>{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTicket(ticket.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Status
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'open')}>
                                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                                Open
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}>
                                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                                In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'resolved')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'closed')}>
                                <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                                Closed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      {searchTerm ? 'No tickets match your search' : 'No tickets found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupportManagement;
