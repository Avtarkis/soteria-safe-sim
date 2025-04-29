
export interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'account' | 'feature_request' | 'other';
  createdAt: string;
  updatedAt: string;
  userEmail?: string; // Adding this to support the email display
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  isAdmin: boolean;
  message: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface TicketFormValues {
  title: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'feature_request' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}
