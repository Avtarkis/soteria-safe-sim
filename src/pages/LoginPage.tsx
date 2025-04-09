
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LoginPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-background/80 to-background dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-bold text-center dark:text-white">Soteria</h1>
          <p className="text-muted-foreground dark:text-gray-300 text-center mt-1">...every second counts.</p>
        </div>
      </div>
      
      <Card className="w-full max-w-md mx-auto border-2 dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center dark:text-white">Sign In</CardTitle>
          <CardDescription className="text-center dark:text-gray-300">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="login" />
          
          <div className="mt-4 text-center text-sm dark:text-gray-300">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary dark:text-blue-400 hover:underline">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center text-xs text-muted-foreground dark:text-gray-400">
        <p>
          By using Soteria, you agree to our{' '}
          <a href="#" className="text-primary dark:text-blue-400 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary dark:text-blue-400 hover:underline">
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
