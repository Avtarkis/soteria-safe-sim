
import React from 'react';
import { format } from 'date-fns';
import { SupportTicket } from '@/types/support';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface TicketTableProps {
  tickets: SupportTicket[];
  onViewTicket: (ticketId: string) => void;
  onUpdateStatus: (ticketId: string, status: string) => void;
  loading: boolean;
  searchTerm: string;
}

export const TicketTable = ({
  tickets,
  onViewTicket,
  onUpdateStatus,
  loading,
  searchTerm
}: TicketTableProps) => {

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
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
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
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
                    onClick={() => onViewTicket(ticket.id)}
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
                      <DropdownMenuItem onClick={() => onUpdateStatus(ticket.id, 'open')}>
                        <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus(ticket.id, 'in_progress')}>
                        <Clock className="mr-2 h-4 w-4 text-blue-500" />
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus(ticket.id, 'resolved')}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Resolved
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus(ticket.id, 'closed')}>
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
  );
};
