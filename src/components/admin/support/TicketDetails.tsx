
import React from 'react';
import { format } from 'date-fns';
import { SupportTicket } from '@/types/support';
import { 
  AlertTriangle,
  Clock,
  CheckCircle,
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface TicketDetailsProps {
  ticket: SupportTicket;
  updatingStatus: boolean;
  onUpdateStatus: (status: 'open' | 'in_progress' | 'resolved' | 'closed') => void;
}

export const TicketDetails = ({ 
  ticket, 
  updatingStatus,
  onUpdateStatus
}: TicketDetailsProps) => {
  
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

  return (
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
            onValueChange={(value) => onUpdateStatus(value as 'open' | 'in_progress' | 'resolved' | 'closed')}
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
  );
};
