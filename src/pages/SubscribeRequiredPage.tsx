
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, ExternalLink, Smartphone } from 'lucide-react';

const SubscribeRequiredPage = () => {
  const handleOpenWebsite = () => {
    // In a real app, this would open the actual website
    window.open(window.location.origin, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="border-2 border-yellow-500 bg-gray-800 text-white">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500">
              <Crown className="h-8 w-8 text-gray-900" />
            </div>
            <CardTitle className="text-2xl">Subscription Required</CardTitle>
            <CardDescription className="text-gray-300">
              This mobile app requires an active subscription to access premium safety features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-yellow-500">
                <Smartphone className="h-5 w-5" />
                <span className="text-sm font-medium">Mobile App Access</span>
              </div>
              
              <p className="text-sm text-gray-300">
                To use Soteria on mobile devices, please subscribe on our website first. 
                Your subscription will then activate access to all mobile features.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleOpenWebsite}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Website to Subscribe
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/login'}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Already subscribed? Sign In
              </Button>
            </div>

            <div className="text-xs text-gray-400 text-center">
              <p>
                Your subscription includes:
              </p>
              <ul className="mt-2 space-y-1">
                <li>• Real-time threat detection</li>
                <li>• Emergency response system</li>
                <li>• Family safety monitoring</li>
                <li>• 24/7 support access</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscribeRequiredPage;
