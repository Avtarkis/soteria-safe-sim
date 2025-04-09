
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to handle email verification
 */
export const useEmailVerification = () => {
  const { toast } = useToast();

  // Check for email verification parameters in URL
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
};

export default useEmailVerification;
