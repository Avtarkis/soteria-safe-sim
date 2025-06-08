
import { useState, useEffect } from 'react';

export type SubscriptionTier = 'free' | 'individual' | 'family' | 'premium';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionTier: SubscriptionTier;
  checkSubscription: () => void;
  isLoading: boolean;
}

const useSubscriptionStatus = (): SubscriptionStatus => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = () => {
    setIsLoading(true);
    // Check for active subscription in localStorage or API
    const savedSubscription = localStorage.getItem('subscription_status');
    if (savedSubscription) {
      const subscriptionData = JSON.parse(savedSubscription);
      setHasActiveSubscription(subscriptionData.active || false);
      setSubscriptionTier(subscriptionData.tier || 'free');
    } else {
      setHasActiveSubscription(false);
      setSubscriptionTier('free');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return {
    hasActiveSubscription,
    subscriptionTier,
    checkSubscription,
    isLoading
  };
};

export default useSubscriptionStatus;
