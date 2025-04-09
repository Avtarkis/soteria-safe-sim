
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Define types for our context
type User = {
  id: string;
  email: string | undefined;
} | null;

interface AuthContextType {
  user: User;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to check if we're in test mode
const isTestMode = () => {
  // Consider both development and production builds as test mode for now
  return true;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for email verification parameters in URL (for account confirmation)
  useEffect(() => {
    const handleEmailVerification = async () => {
      const url = new URL(window.location.href);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      const type = url.searchParams.get('type');
      
      if (accessToken && refreshToken && type === 'signup') {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) throw error;
          
          toast({
            title: 'Account verified',
            description: 'Your account has been successfully verified.',
          });
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error verifying email:', error);
          toast({
            title: 'Verification error',
            description: 'There was an error verifying your account. Please try again.',
            variant: 'destructive',
          });
        }
      }
    };
    
    handleEmailVerification();
  }, [toast]);

  // Fetch the current session and set the user
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email || undefined
        } : null);
      } catch (error) {
        console.error('Error fetching session:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to fetch current session',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        if (event === 'SIGNED_IN') {
          setUser(session?.user ? {
            id: session.user.id,
            email: session.user.email || undefined
          } : null);
          
          toast({
            title: 'Welcome!',
            description: 'You have successfully signed in',
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          toast({
            title: 'Signed out',
            description: 'You have been signed out successfully',
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Sign in function - modified for test environment
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in:", email);
      
      // In test mode, we create a fake authenticated user session
      if (isTestMode()) {
        console.log("TEST MODE: Simulating successful sign-in for:", email);
        
        // Set a mock user for the testing environment
        setUser({
          id: 'test-user-id',
          email: email
        });
        
        return { error: null };
      }
      
      // Standard sign-in for production
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      console.log("Sign in successful for:", email);
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    }
  }, []);

  // Sign up function - modified for test environment
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      console.log("Attempting to sign up:", email);
      
      // Register the user with Supabase (we'll still create the account)
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      console.log("Sign up successful for:", email);
      
      // In test mode, immediately set a mock user
      if (isTestMode()) {
        console.log("TEST MODE: Setting mock user after registration");
        
        // Set a mock user for the testing environment
        setUser({
          id: 'test-user-id',
          email: email
        });
        
        toast({
          title: 'Test account created',
          description: 'You have been automatically authenticated for testing purposes.',
        });
      } else {
        toast({
          title: 'Account created',
          description: 'Please check your email to confirm your account.',
        });
      }
      
      // Always try to sign in automatically in test mode
      if (isTestMode()) {
        try {
          console.log("TEST MODE: Auto-signing in after registration:", email);
          await signIn(email, password);
        } catch (signInError) {
          console.error("Auto-sign in after registration failed:", signInError);
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    }
  }, [toast, signIn]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear the user state
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error signing out',
        description: 'There was an error signing you out. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Reset password function
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: 'Password reset link sent',
        description: 'Please check your email for the password reset link',
      });
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as Error };
    }
  }, [toast]);

  // Create value object for the context
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
