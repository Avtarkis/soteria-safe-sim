
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xdljzbkczhyykhzyillj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbGp6Ymtjemh5eWtoenlpbGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NTY5MzEsImV4cCI6MjA2MTAzMjkzMX0.urlh_YAUvhu64I8ynJRGtdAUTtFURGcTn_vVAgbREAc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Types for our database tables
export interface SecurityLog {
  id: string;
  user_id: string;
  event_type: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface UserAlert {
  id: string;
  user_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: string;
  icon?: string;
  action_text?: string;
  action_link?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'other';
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id?: string;
  message: string;
  is_admin: boolean;
  attachment_url?: string;
  created_at: string;
}

// Helper functions for error handling
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const requireAuth = (user: any) => {
  if (!user) {
    throw new Error('Authentication required. Please sign in to continue.');
  }
  return user;
};
