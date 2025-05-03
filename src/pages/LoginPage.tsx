
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isStoreApp } from '@/utils/platformUtils';
import useSubscriptionStatus from '@/hooks/useSubscriptionStatus';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const { user } = useAuth();
  const { hasActiveSubscription, isLoading: subscriptionLoading } = useSubscriptionStatus();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkedSubscription, setCheckedSubscription] = useState(false);

  // Check for active subscription when user logs in on store app
  useEffect(() => {
    if (user && isStoreApp() && !subscriptionLoading && !checkedSubscription) {
      setCheckedSubscription(true);
      
      if (!hasActiveSubscription) {
        toast({
          title: "Subscription Required",
          description: "Please subscribe on our website before using the mobile app.",
          variant: "destructive",
          duration: 5000,
        });
        
        // Redirect to subscription required page
        navigate('/subscribe-required');
      } else {
        // User has subscription, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [user, hasActiveSubscription, subscriptionLoading, navigate, toast, checkedSubscription]);

  // Redirect if already logged in (for web or non-store app)
  useEffect(() => {
    if (user && !isStoreApp()) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
          <CardTitle className="text-2xl font-bold text-center text-white">Sign In</CardTitle>
          <CardDescription className="text-center text-gray-300">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="login" />
          
          <div className="mt-4 text-center text-sm text-gray-300">
            Don't have an account?{' '}
            {isStoreApp() ? (
              <a 
                href="#" 
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  // In a real app, this would be your actual website URL
                  window.open(window.location.origin, '_blank');
                }}
              >
                Sign up on our website
              </a>
            ) : (
              <a href="/signup" className="text-primary hover:underline">
                Sign up
              </a>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>
          By using Soteria, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
        <p className="mt-4">
          © 2025 Soteria Security. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
