
import { createClient } from '@supabase/supabase-js';

// Environment variables that come from Supabase's integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Define types for our database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          full_name: string | null;
          email: string;
          avatar_url: string | null;
          preferences: {
            threatTypes: string[];
            notifications: boolean;
          } | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          full_name?: string | null;
          email: string;
          avatar_url?: string | null;
          preferences?: {
            threatTypes: string[];
            notifications: boolean;
          } | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          full_name?: string | null;
          email?: string;
          avatar_url?: string | null;
          preferences?: {
            threatTypes: string[];
            notifications: boolean;
          } | null;
        };
      };
      threat_alerts: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          level: 'low' | 'medium' | 'high';
          user_id: string;
          action: string | null;
          resolved: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
          level: 'low' | 'medium' | 'high';
          user_id: string;
          action?: string | null;
          resolved?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          level?: 'low' | 'medium' | 'high';
          user_id?: string;
          action?: string | null;
          resolved?: boolean;
        };
      };
      security_logs: {
        Row: {
          id: string;
          created_at: string;
          event_type: string;
          details: Record<string, unknown>;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          event_type: string;
          details: Record<string, unknown>;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          event_type?: string;
          details?: Record<string, unknown>;
          user_id?: string;
        };
      };
    };
  };
};

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ThreatAlert = Database['public']['Tables']['threat_alerts']['Row'];
export type SecurityLog = Database['public']['Tables']['security_logs']['Row'];
