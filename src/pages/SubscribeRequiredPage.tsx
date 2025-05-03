
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

const SubscribeRequiredPage = () => {
  // Generate the web URL for users to sign up
  const getWebsiteUrl = () => {
    // In a real app, this would point to your actual web domain
    // For now we'll use the same origin for testing
    return window.location.origin;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-bold text-center text-white">Soteria</h1>
          <p className="text-gray-300 text-center mt-1">...every second counts.</p>
        </div>
      </div>
      
      <Card className="w-full max-w-md mx-auto border-2 border-gray-700 bg-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Subscription Required</CardTitle>
          <CardDescription className="text-center text-gray-300">
            You need an active subscription to use this app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-gray-300 text-center">
            <p className="mb-4">
              Please visit our website to create an account and subscribe to a plan before using the mobile app.
            </p>
            <p className="mb-4">
              All features are available after signing up on our website.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <Button 
              variant="default" 
              onClick={() => window.open(getWebsiteUrl(), '_blank')}
              className="flex items-center gap-2"
            >
              Go to Website <ExternalLink size={16} />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <div className="text-sm text-gray-400">
            Already have a subscription? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
          </div>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>© 2025 Soteria Security. All rights reserved.</p>
      </div>
    </div>
  );
};

export default SubscribeRequiredPage;
