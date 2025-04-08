import { createClient } from '@supabase/supabase-js';

// Try to get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://momujszivwegjajwzngy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXVqc3ppdndlZ2phand6bmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMTgyMTcsImV4cCI6MjA1OTY5NDIxN30.u12Ut80z2iNxmyTH2_m96lroygpARxv9s3AKjDfBLMQ';

// Check if we're missing environment variables but we have hardcoded fallbacks
const isUsingHardcodedValues = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

if (isUsingHardcodedValues) {
  console.warn('Using hardcoded Supabase credentials. For production, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Lovable environment variables.');
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
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ThreatAlert = Database['public']['Tables']['threat_alerts']['Row'];
export type SecurityLog = Database['public']['Tables']['security_logs']['Row'];

// Helper function to check if we're using fallback values
export const isUsingFallbackValues = () => {
  return isUsingHardcodedValues;
};
