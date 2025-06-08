
import { useState, useEffect } from 'react';

export type SubscriptionTier = 'free' | 'individual' | 'family' | 'premium';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionTier: SubscriptionTier;
  checkSubscription: () => void;
}

const useSubscriptionStatus = (): SubscriptionStatus => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');

  const checkSubscription = () => {
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
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return {
    hasActiveSubscription,
    subscriptionTier,
    checkSubscription
  };
};

export default useSubscriptionStatus;
