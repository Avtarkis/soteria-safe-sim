
import { createClient } from '@supabase/supabase-js';

// Try to get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we're missing environment variables and use development fallbacks if needed
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using development fallbacks to prevent blank screen.');
}

// Create a development fallback that won't crash the app
const url = supabaseUrl || 'https://placeholder-url.supabase.co';
const key = supabaseAnonKey || 'placeholder-key-to-prevent-crash';

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
          latitude?: number;
          longitude?: number;
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
          latitude?: number;
          longitude?: number;
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
          latitude?: number;
          longitude?: number;
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
export const supabase = createClient<Database>(url, key);

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ThreatAlert = Database['public']['Tables']['threat_alerts']['Row'];
export type SecurityLog = Database['public']['Tables']['security_logs']['Row'];
