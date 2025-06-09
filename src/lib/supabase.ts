
import { createClient } from '@supabase/supabase-js';

// Use the centralized Supabase configuration
const supabaseUrl = 'https://xdljzbkczhyykhzyillj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbGp6Ymtjemh5eWtoenlpbGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NTY5MzEsImV4cCI6MjA2MTAzMjkzMX0.urlh_YAUvhu64I8ynJRGtdAUTtFURGcTn_vVAgbREAc';

// Create a single instance to be reused throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Export common types
export interface ThreatAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  source: string;
  type: string;
}

export interface SecurityLog {
  id: string;
  user_id: string;
  event: string;
  timestamp: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}
