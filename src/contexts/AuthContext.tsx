import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to determine if we're in dev mode with no valid Supabase connection
const isDevEnvironment = () => {
  return import.meta.env.DEV && 
    (!import.meta.env.VITE_SUPABASE_URL || 
     import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url'));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;
      
      // Skip profile fetching in dev mode without Supabase
      if (isDevEnvironment()) {
        setProfile({
          id: user.id,
          created_at: new Date().toISOString(),
          email: user.email || '',
          full_name: 'Dev User',
          avatar_url: null,
          preferences: {
            threatTypes: ['Cyber', 'Physical', 'Environmental'],
            notifications: true,
          }
        });
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    getProfile();
  }, [user]);

  useEffect(() => {
    const setData = async () => {
      try {
        // In development mode without Supabase, skip the real auth check
        if (isDevEnvironment()) {
          console.log('Running in development mode without Supabase connection');
          setLoading(false);
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Error getting session:', error);
        setLoading(false);
      }
    };
    
    // In dev mode, we can skip the subscription to auth changes
    if (isDevEnvironment()) {
      setData();
      return;
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    setData();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      // In development mode, simulate successful signup
      if (isDevEnvironment()) {
        console.log('Development mode: Simulating sign up for', email);
        
        // Create a simulated user
        const devUser = { 
          id: 'dev-user-id',
          email,
          created_at: new Date().toISOString(),
        } as User;
        
        setUser(devUser);
        
        // Create a simulated session
        const devSession = { 
          user: devUser,
          access_token: 'dev-token',
          refresh_token: 'dev-refresh-token',
          expires_at: Date.now() + 3600,
        } as Session;
        
        setSession(devSession);
        
        // Create a simulated profile
        setProfile({
          id: devUser.id,
          created_at: new Date().toISOString(),
          email: email,
          full_name: null,
          avatar_url: null,
          preferences: {
            threatTypes: ['Cyber', 'Physical', 'Environmental'],
            notifications: true,
          }
        });
        
        toast({
          title: "Development Mode",
          description: "Sign up simulated successfully. You're now logged in.",
        });
        
        return { error: null };
      }
      
      // Actual Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error: error.message };
      }
      
      if (data.user) {
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: email,
            preferences: {
              threatTypes: ['Cyber', 'Physical', 'Environmental'],
              notifications: true,
            },
          });
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
        }
        
        toast({
          title: "Sign Up Successful",
          description: "Your account has been created.",
        });
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error during sign up:', error);
      
      toast({
        title: "Sign Up Failed",
        description: "Unable to connect to authentication service. Please try again later.",
        variant: "destructive",
      });
      
      return { error: 'An unexpected error occurred' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // In development mode, simulate successful login
      if (isDevEnvironment()) {
        console.log('Development mode: Simulating sign in for', email);
        
        // Create a simulated user
        const devUser = { 
          id: 'dev-user-id',
          email,
          created_at: new Date().toISOString(),
        } as User;
        
        setUser(devUser);
        
        // Create a simulated session
        const devSession = { 
          user: devUser,
          access_token: 'dev-token',
          refresh_token: 'dev-refresh-token',
          expires_at: Date.now() + 3600,
        } as Session;
        
        setSession(devSession);
        
        // Create a simulated profile
        setProfile({
          id: devUser.id,
          created_at: new Date().toISOString(),
          email: email,
          full_name: null,
          avatar_url: null,
          preferences: {
            threatTypes: ['Cyber', 'Physical', 'Environmental'],
            notifications: true,
          }
        });
        
        toast({
          title: "Development Mode",
          description: "Sign in simulated successfully. You're now logged in.",
        });
        
        return { error: null };
      }
      
      // Actual Supabase login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error: error.message };
      }
      
      toast({
        title: "Sign In Successful",
        description: "Welcome back!",
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      
      toast({
        title: "Sign In Failed",
        description: "Unable to connect to authentication service. Please try again later.",
        variant: "destructive",
      });
      
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      // In development mode, simulate sign out
      if (isDevEnvironment()) {
        setUser(null);
        setSession(null);
        setProfile(null);
        
        toast({
          title: "Development Mode",
          description: "Sign out simulated successfully.",
        });
        
        return;
      }
      
      // Actual Supabase sign out
      await supabase.auth.signOut();
      toast({
        title: "Sign Out Successful",
        description: "You have been signed out.",
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        title: "Sign Out Failed",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // In development mode, simulate profile update
      if (isDevEnvironment()) {
        setProfile(prev => prev ? { ...prev, ...data } : null);
        
        toast({
          title: "Development Mode",
          description: "Profile update simulated successfully.",
        });
        
        return;
      }
      
      // Actual Supabase profile update
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // In development mode, simulate successful reset
      if (isDevEnvironment()) {
        console.log('Development mode: Simulating password reset for', email);
        
        toast({
          title: "Development Mode",
          description: "Password reset simulated successfully. Check your email.",
        });
        
        return { error: null };
      }
      
      // Actual Supabase reset password
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Reset Password Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error: error.message };
      }
      
      toast({
        title: "Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error during password reset:', error);
      
      toast({
        title: "Reset Failed",
        description: "Unable to connect to authentication service. Please try again later.",
        variant: "destructive",
      });
      
      return { error: 'An unexpected error occurred' };
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
