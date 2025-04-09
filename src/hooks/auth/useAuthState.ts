
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/auth';

/**
 * Hook to handle authentication state
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for current session and set up auth state listener
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

  return { user, setUser, loading, setLoading };
};

export default useAuthState;
