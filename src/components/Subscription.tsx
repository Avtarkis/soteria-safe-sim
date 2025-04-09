
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Check } from 'lucide-react';

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<'individual' | 'family' | null>(null);

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
    console.log(`Selected ${plan} plan`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Choose Your Safety Plan</h1>
        <p className="text-muted-foreground">
          Select the plan that best fits your needs and keep you and your loved ones safe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Individual Plan */}
        <Card className={`border-2 ${selectedPlan === 'individual' ? 'border-primary' : 'border-border'} hover:shadow-lg transition-all`}>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-between">
              Individual Plan
              <span className="text-lg font-normal text-muted-foreground">$4.99/month</span>
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
              Subscribe Now
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
              <span className="text-lg font-normal text-muted-foreground">$19.99/month</span>
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
              Subscribe Now
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Why Choose Soteria?</h3>
        <p className="mb-6">
          Our advanced safety platform provides real-time threat intelligence and personalized safety recommendations,
          ensuring you're prepared wherever you go. With Soteria, every second counts.
        </p>
        <p className="text-sm text-muted-foreground">
          All plans include a 14-day free trial. Cancel anytime. <br />
          For enterprise solutions, please contact our sales team.
        </p>
      </div>
    </div>
  );
};

export default Subscription;
