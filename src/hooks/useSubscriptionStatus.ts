
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export type SubscriptionTier = 'individual' | 'family' | null;

export const useSubscriptionStatus = () => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has an active subscription
  const checkSubscription = async () => {
    if (!user) {
      setHasActiveSubscription(false);
      setSubscriptionTier(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // For now, we'll simulate this check since we don't have an actual subscription table
      // In production, you would query your subscriptions table
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking subscription status:', error);
        setHasActiveSubscription(false);
      } else {
        setHasActiveSubscription(data?.subscribed || false);
        setSubscriptionTier(data?.subscription_tier as SubscriptionTier || null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Fallback to development mode for testing
      if (import.meta.env.DEV) {
        // For testing in development, we can simulate a subscription
        const mockSubscribed = localStorage.getItem('mock_subscription') === 'true';
        const mockTier = localStorage.getItem('mock_subscription_tier') as SubscriptionTier;
        setHasActiveSubscription(mockSubscribed);
        setSubscriptionTier(mockTier);
      } else {
        setHasActiveSubscription(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // For development testing only
  const setMockSubscription = (subscribed: boolean, tier: SubscriptionTier) => {
    if (import.meta.env.DEV) {
      localStorage.setItem('mock_subscription', subscribed.toString());
      localStorage.setItem('mock_subscription_tier', tier || '');
      checkSubscription();
    }
  };

  useEffect(() => {
    checkSubscription();
    // Check subscription whenever user changes
  }, [user]);

  return { 
    hasActiveSubscription, 
    subscriptionTier, 
    isLoading, 
    checkSubscription,
    setMockSubscription  // Only for development testing
  };
};

export default useSubscriptionStatus;
