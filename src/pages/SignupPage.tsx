
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isStoreApp, isWeb } from '@/utils/platformUtils';

const SignupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If we're on a store app, redirect to web for signup
  useEffect(() => {
    if (isStoreApp()) {
      // In a real app, this would redirect to your actual website
      window.location.href = window.location.origin;
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // If on web, redirect to subscription page after signup
      if (isWeb()) {
        navigate('/subscription');
      } else {
        // On non-store mobile app, go to dashboard
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // If we're on a store app, we shouldn't show the signup form
  if (isStoreApp()) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-800 to-gray-900 p-4">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Redirecting to Website</h1>
          <p>Please sign up on our website...</p>
        </div>
      </div>
    );
  }

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
          <CardTitle className="text-2xl font-bold text-center text-white">Create an Account</CardTitle>
          <CardDescription className="text-center text-gray-300">
            Enter your information to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="signup" />
          
          <div className="mt-4 text-center text-sm text-gray-300">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
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

export default SignupPage;
