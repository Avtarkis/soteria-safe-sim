
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from './ui/card';
import { useLocationBasedCurrency } from '@/hooks/useLocationBasedCurrency';
import { useToast } from '@/hooks/use-toast';
import { isStoreApp } from '@/utils/platformUtils';
import useSubscriptionStatus from '@/hooks/useSubscriptionStatus';
import { useNavigate } from 'react-router-dom';

// Import refactored components
import PlanCard from './subscription/PlanCard';
import FeatureComparison from './subscription/FeatureComparison';
import FeatureShowcase from './subscription/FeatureShowcase';
import FaqSection from './subscription/FaqSection';
import CallToAction from './subscription/CallToAction';
import CurrencySelector from './subscription/CurrencySelector';
import CurrentSubscription from './subscription/CurrentSubscription';

// Import data
import { comparisonFeatures, getFeatureShowcaseItems, faqItems } from './subscription/FeatureData';

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<'individual' | 'family' | null>(null);
  const { currency, country, isLoading, attemptCurrencyChange } = useLocationBasedCurrency();
  const { toast } = useToast();
  const { hasActiveSubscription, subscriptionTier, checkSubscription } = useSubscriptionStatus();
  const navigate = useNavigate();
  
  // If this is a store app, redirect to dashboard
  useEffect(() => {
    if (isStoreApp()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const individualFeatures = [
    'Real-time threat detection',
    'Global safety alerts',
    'Emergency services contact',
    'Travel advisories',
    'Family location sharing (1 person)',
  ];

  const familyFeatures = [
    'All Individual Plan features',
    'Family location sharing (up to 6 people)',
    'Safety check-ins',
    'Emergency broadcasts to family',
    'Customized safety zones',
    'Shared emergency contacts',
  ];

  const handleSubscribe = (plan: 'individual' | 'family') => {
    setSelectedPlan(plan);
    // Here you would integrate with a payment provider
    toast({
      title: "Free Trial Started",
      description: `Your 14-day free trial for the ${plan === 'individual' ? 'Individual' : 'Family'} plan has begun! Your payment method will be securely stored for automatic billing after the trial.`,
      duration: 5000,
    });
    setTimeout(() => {
      // Simulate successful subscription
      checkSubscription();
      
      // After subscription, show download app message
      toast({
        title: "Download Mobile App",
        description: "For the full experience, download the mobile app from your app store.",
        duration: 5000,
      });
    }, 1500);
    console.log(`Selected ${plan} plan with currency ${currency}`);
  };

  const getPriceDisplay = (plan: 'individual' | 'family') => {
    const basePrice = plan === 'individual' ? 
      (currency === 'usd' ? '$4.99' : '₦499') : 
      (currency === 'usd' ? '$19.99' : '₦1,999');
    
    return (
      <div className="flex flex-col">
        <div className="text-xl font-semibold">{basePrice}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
        <div className="text-sm text-primary mt-1">14-day free trial</div>
      </div>
    );
  };

  // If this is a store app, don't render the subscription component
  if (isStoreApp()) {
    return null;
  }

  // If user has an active subscription, show their current plan
  if (hasActiveSubscription) {
    return (
      <CurrentSubscription 
        subscriptionTier={subscriptionTier} 
        individualFeatures={individualFeatures}
        familyFeatures={familyFeatures}
        checkSubscription={checkSubscription}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Choose Your Safety Plan</h1>
        <p className="text-muted-foreground">
          Select the plan that best fits your needs and keep you and your loved ones safe.
        </p>
        <div className="mt-4 text-primary font-semibold bg-primary/10 py-2 px-4 rounded-lg inline-block">
          All plans include a 14-day free trial - cancel anytime
        </div>
      </div>

      {/* Currency Selector */}
      <CurrencySelector 
        currency={currency}
        country={country}
        isLoading={isLoading}
        attemptCurrencyChange={attemptCurrencyChange}
      />

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
        {/* Individual Plan */}
        <PlanCard
          title="Individual Plan"
          description="Perfect for solo travelers and individuals"
          price={getPriceDisplay('individual')}
          features={individualFeatures}
          buttonText="Protect Me"
          isSelected={selectedPlan === 'individual'}
          onSubscribe={() => handleSubscribe('individual')}
        />

        {/* Family Plan */}
        <PlanCard
          title="Family Plan"
          description="Protect your entire family (up to 6 people)"
          price={getPriceDisplay('family')}
          features={familyFeatures}
          buttonText="Protect My Family"
          isPopular={true}
          isSelected={selectedPlan === 'family'}
          onSubscribe={() => handleSubscribe('family')}
        />
      </div>

      {/* Feature Comparison Table */}
      <FeatureComparison features={comparisonFeatures} />
      
      {/* Feature Showcase */}
      <FeatureShowcase items={getFeatureShowcaseItems()} />
      
      {/* FAQ Section */}
      <FaqSection items={faqItems} />
      
      {/* Call to Action */}
      <CallToAction 
        title="Start Your 14-Day Free Trial" 
        description="Choose a premium plan that fits your security needs."
        buttonText="Get Protected" 
      />
    </div>
  );
};

export default Subscription;
