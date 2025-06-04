
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionType: 'free' | 'basic' | 'premium' | 'enterprise';
  expiresAt: Date | null;
  isLoading: boolean;
}

const useSubscriptionStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: true, // Default to true for testing
    subscriptionType: 'premium',
    expiresAt: null,
    isLoading: true
  });

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user) {
        setStatus({
          hasActiveSubscription: false,
          subscriptionType: 'free',
          expiresAt: null,
          isLoading: false
        });
        return;
      }

      try {
        setStatus(prev => ({ ...prev, isLoading: true }));
        
        // In a real app, this would check subscription status from the database
        // For testing, we'll simulate an active subscription
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus({
          hasActiveSubscription: true,
          subscriptionType: 'premium',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          isLoading: false
        });
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setStatus({
          hasActiveSubscription: false,
          subscriptionType: 'free',
          expiresAt: null,
          isLoading: false
        });
      }
    };

    checkSubscriptionStatus();
  }, [user]);

  return status;
};

export default useSubscriptionStatus;
