
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface CurrentSubscriptionProps {
  subscriptionTier: 'individual' | 'family';
  individualFeatures: string[];
  familyFeatures: string[];
  checkSubscription: () => void;
}

const CurrentSubscription = ({
  subscriptionTier,
  individualFeatures,
  familyFeatures,
  checkSubscription,
}: CurrentSubscriptionProps) => {
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
          <CardContent className="px-6 py-4 space-y-2">
            <p>You have access to all premium features:</p>
            <ul className="space-y-2">
              {(subscriptionTier === 'individual' ? individualFeatures : familyFeatures).map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="border-t pt-4 flex flex-col">
            <p className="text-sm text-center mb-4">
              For the full experience, download our mobile app from your device's app store.
            </p>
            <Button variant="outline" onClick={checkSubscription}>
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
};

export default CurrentSubscription;
