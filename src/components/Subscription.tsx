import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Check } from 'lucide-react';
import { useLocationBasedCurrency } from '@/hooks/useLocationBasedCurrency';
import { useToast } from '@/hooks/use-toast';
import { isStoreApp } from '@/utils/platformUtils';
import useSubscriptionStatus from '@/hooks/useSubscriptionStatus';
import { useNavigate } from 'react-router-dom';

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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Your Subscription</h1>
          <p className="text-muted-foreground">
            Thank you for subscribing to Soteria. Your safety is our priority.
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {subscriptionTier === 'individual' ? 'Individual Plan' : 'Family Plan'}
                  </CardTitle>
                  <CardDescription>Active Subscription</CardDescription>
                </div>
                <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Current Plan
                </div>
              </div>
            </CardHeader>
            <div className="px-6 py-4 space-y-2">
              <p>You have access to all premium features:</p>
              <ul className="space-y-2">
                {(subscriptionTier === 'individual' ? individualFeatures : familyFeatures).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <CardFooter className="border-t pt-4 flex flex-col">
              <p className="text-sm text-center mb-4">
                For the full experience, download our mobile app from your device's app store.
              </p>
              <Button variant="outline" onClick={() => checkSubscription()}>
                Refresh Subscription Status
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8 text-center max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground">
            To manage your subscription details including billing information, please contact customer support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Choose Your Safety Plan</h1>
        <p className="text-muted-foreground">
          Select the plan that best fits your needs and keep you and your loved ones safe.
        </p>
        <div className="mt-4 text-primary font-medium">
          All plans include a 14-day free trial - cancel anytime
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-6">
            <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 inline-flex items-center">
              <span className="mr-2">Currency:</span>
              <div className="flex border rounded-md">
                <button
                  onClick={() => attemptCurrencyChange('usd')}
                  className={`px-3 py-1 ${
                    currency === 'usd' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-transparent'
                  } rounded-l-md transition-colors`}
                  disabled={country !== 'United States of America'}
                >
                  USD ($)
                </button>
                <button
                  onClick={() => attemptCurrencyChange('ngn')}
                  className={`px-3 py-1 ${
                    currency === 'ngn' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-transparent'
                  } rounded-r-md transition-colors`}
                  disabled={country !== 'Nigeria'}
                >
                  NGN (₦)
                </button>
              </div>
              {country && (
                <span className="ml-3 text-sm">
                  Detected location: <strong>{country}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Individual Plan */}
            <Card className={`border-2 ${selectedPlan === 'individual' ? 'border-primary' : 'border-border'} hover:shadow-lg transition-all`}>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-between">
                  Individual Plan
                  <div>
                    {getPriceDisplay('individual')}
                  </div>
                </CardTitle>
                <CardDescription>Perfect for solo travelers and individuals</CardDescription>
              </CardHeader>
              <div className="px-6 py-2">
                <ul className="space-y-2">
                  {individualFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <CardFooter className="flex justify-center pt-6 pb-6">
                <Button 
                  className="w-full"
                  onClick={() => handleSubscribe('individual')}
                >
                  Protect Me
                </Button>
              </CardFooter>
            </Card>

            {/* Family Plan */}
            <Card className={`border-2 ${selectedPlan === 'family' ? 'border-primary' : 'border-border'} hover:shadow-lg transition-all`}>
              <CardHeader>
                <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Most Popular
                </div>
                <CardTitle className="text-2xl flex items-center justify-between">
                  Family Plan
                  <div>
                    {getPriceDisplay('family')}
                  </div>
                </CardTitle>
                <CardDescription>Protect your entire family (up to 6 people)</CardDescription>
              </CardHeader>
              <div className="px-6 py-2">
                <ul className="space-y-2">
                  {familyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <CardFooter className="flex justify-center pt-6 pb-6">
                <Button 
                  variant="default"
                  className="w-full"
                  onClick={() => handleSubscribe('family')}
                >
                  Protect My Family
                </Button>
              </CardFooter>
            </Card>
          </div>
        </>
      )}

      <div className="mb-12 mt-12">
        <h2 className="text-2xl font-semibold mb-8 text-center">Compare Features</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b">
                <th className="py-4 px-4 text-left font-medium">Feature</th>
                <th className="py-4 px-4 text-center font-medium">Premium</th>
                <th className="py-4 px-4 text-center font-medium">Family</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'ai-threat', name: 'AI Threat Detection', premium: 'Advanced', family: 'Advanced+' },
                { id: 'dark-web', name: 'Dark Web Monitoring', premium: 'Comprehensive', family: 'Comprehensive' },
                { id: 'devices', name: 'Device Protection', premium: '1 Device', family: 'Up to 5 devices' },
                { id: 'voice', name: 'Voice Assistant', premium: true, family: true },
                { id: 'support', name: 'Support', premium: '24/7 Priority', family: '24/7 Priority' },
                { id: 'disaster', name: 'Natural Disaster Detection', premium: true, family: true },
                { id: 'incident', name: 'Live Incident Capturing', premium: true, family: true },
                { id: 'police', name: 'Instant Police Voice Call', premium: true, family: true },
                { id: 'radius', name: '200m Radius Alert', premium: true, family: true },
                { id: 'smartwatch', name: 'Smartwatch Integration', premium: true, family: true },
                { id: 'safety-ai', name: 'Personalized Safety AI', premium: true, family: true },
                { id: 'health', name: 'Health Monitoring', premium: true, family: true },
                { id: 'family-location', name: 'Family Location Sharing', premium: false, family: true },
              ].map((feature) => (
                <tr key={feature.id} className="border-b">
                  <td className="py-4 px-4">{feature.name}</td>
                  <td className="py-4 px-4 text-center">
                    {typeof feature.premium === 'boolean' ? (
                      feature.premium ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <Cross className="h-5 w-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      feature.premium
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {typeof feature.family === 'boolean' ? (
                      feature.family ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <Cross className="h-5 w-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      feature.family
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-2 text-center">Premium Features</h2>
        <p className="text-center text-muted-foreground mb-8">Click on any feature to see a simulation of how it works</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {featureShowcase.slice(0, 12).map((feature) => (
            <Card key={feature.id} className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  {feature.icon}
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqItems.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="bg-primary text-primary-foreground rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Start Your 14-Day Free Trial</h2>
        <p className="mb-6">Choose a premium plan that fits your security needs.</p>
        <Button variant="secondary" size="lg" className="group">
          Get Protected <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

const Cross = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6L6 18"></path>
    <path d="M6 6l12 12"></path>
  </svg>
);

const AlertTriangle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const Camera = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const Phone = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
  </svg>
);

const Mic = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"></path>
    <path d="M19 10v2a7 7 0 01-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const Watch = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="7"></circle>
    <polyline points="12 9 12 12 13.5 13.5"></polyline>
    <path d="M16.51 17.35l-.35 3.83a2 2 0 01-2 1.82H9.83a2 2 0 01-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 019.83 1h4.35a2 2 0 012 1.82l.35 3.83"></path>
  </svg>
);

const Volume2 = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"></path>
  </svg>
);

const Heart = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
  </svg>
);

const EyeOff = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export default Subscription;
const featureShowcase = [
  {
    id: 'ai-emergency',
    icon: <Bell className="h-6 w-6 text-primary" />,
    title: 'AI Emergency Alert',
    description: 'Instantly notifies family, law enforcement and emergency responders when a threat is detected.'
  },
  {
    id: 'disaster',
    icon: <AlertTriangle className="h-6 w-6 text-primary" />,
    title: 'Natural Disaster Detection',
    description: 'Detects natural disasters and provides safe evacuation routes.'
  },
  {
    id: 'incident',
    icon: <Camera className="h-6 w-6 text-primary" />,
    title: 'Live Incident Capturing',
    description: 'Uses your phone to capture evidence of incidents for sharing with authorities.'
  },
  {
    id: 'police',
    icon: <Phone className="h-6 w-6 text-primary" />,
    title: 'Instant Police Call',
    description: 'Activates an instant police voice call to deter attackers.'
  },
  {
    id: 'ai-threat',
    icon: <Mic className="h-6 w-6 text-primary" />,
    title: 'AI Threat Detection',
    description: 'Recognizes gunshots, screams, and violent incidents.'
  },
  {
    id: 'radius',
    icon: <MapPin className="h-6 w-6 text-primary" />,
    title: '200m Radius Alert',
    description: 'Sends SOS alerts to nearby mobile users for community response.'
  },
  {
    id: 'cyber',
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: 'Cyber Threat Detection',
    description: 'Identifies and blocks digital threats before they compromise your security.'
  },
  {
    id: 'smartwatch',
    icon: <Watch className="h-6 w-6 text-primary" />,
    title: 'Smartwatch Integration',
    description: 'Using DarkTrace Technology, Soteria integrates with smartwatches, causing them to vibrate to warn users of potential threats even when your phone is not accessible.'
  },
  {
    id: 'emergency',
    icon: <Bell className="h-6 w-6 text-primary" />,
    title: 'Emergency Services',
    description: 'Works with emergency service APIs for direct dispatch.'
  },
  {
    id: 'siren',
    icon: <Volume2 className="h-6 w-6 text-primary" />,
    title: 'Police Siren Mode',
    description: 'Plays convincing police siren sounds to deter attackers.'
  },
  {
    id: 'health',
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: 'Health Monitor',
    description: 'Monitors health status and alerts contacts in emergencies.'
  },
  {
    id: 'stealth',
    icon: <EyeOff className="h-6 w-6 text-primary" />,
    title: 'Stealth Mode',
    description: 'Works in the background undetected by attackers.'
  }
];

const faqItems = [
  {
    question: 'Can I cancel my subscription at any time?',
    answer: 'Yes, you can cancel your Premium subscription at any time. You\'ll continue to have access to Premium features until the end of your billing period.'
  },
  {
    question: 'How does the family plan work?',
    answer: 'With the Premium plan, you can add up to 5 family members. Each member will have their own account with full Premium features, all managed from your account.'
  },
  {
    question: 'Will my subscription automatically renew?',
    answer: 'Yes, subscriptions automatically renew to ensure continuous protection. You\'ll be notified before renewal and can cancel anytime.'
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes, we use industry-standard encryption for all payments and never store your full credit card details on our servers.'
  }
];
