
import React from 'react';
import { format } from 'date-fns';
import { SupportTicket } from '@/types/support';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Badge
} from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

interface TicketsListProps {
  tickets: SupportTicket[];
  loading: boolean;
  onViewTicket: (ticketId: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
}

const TicketsList = ({ tickets, loading, onViewTicket, getStatusIcon }: TicketsListProps) => {
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
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
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
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You haven't created any support tickets yet. Click the "New Support Ticket" button above to get help.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Support Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} className="group hover:bg-muted/50">
                <TableCell className="font-medium">{ticket.title}</TableCell>
                <TableCell>{getCategoryLabel(ticket.category)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(ticket.status)}
                    <span className="ml-2">
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewTicket(ticket.id)}
                    className="invisible group-hover:visible"
                  >
                    View
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TicketsList;
