import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { isTestMode } from '@/utils/auth';

/**
 * Hook for authentication methods - sign in, sign up, sign out, password reset
 */
export const useAuthMethods = (setUser: (user: any) => void) => {
  const { toast } = useToast();

  // Sign in function
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
  }, [setUser]);

  // Sign up function
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      console.log("Attempting to sign up:", email);
      
      // In test mode, immediately set a mock user without actual registration
      if (isTestMode()) {
        console.log("TEST MODE: Setting mock user for registration");
        
        // Set a mock user for the testing environment
        setUser({
          id: 'test-user-id',
          email: email
        });
        
        toast({
          title: 'Test account created',
          description: 'You have been automatically authenticated for testing purposes.',
        });
        
        return { error: null };
      }
      
      // Register the user with Supabase if not in test mode
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      console.log("Sign up successful for:", email);
      
      toast({
        title: 'Account created',
        description: 'Please check your email to confirm your account.',
      });
      
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    }
  }, [toast, setUser]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear the user state
      setUser(null);
      
      // Redirect to sign in page after sign out
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error signing out',
        description: 'There was an error signing you out. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast, setUser]);

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

  return { signIn, signUp, signOut, resetPassword };
};

export default useAuthMethods;
