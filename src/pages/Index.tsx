
import React, { useState, useEffect } from 'react';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';
import ForgotPassword from '@/components/ForgotPassword';

const Index = () => {
  const [activeForm, setActiveForm] = useState<'signIn' | 'signUp' | 'forgotPassword'>('signIn');
  const [formLoaded, setFormLoaded] = useState(false);

  // Ensure form stays visible after loading
  useEffect(() => {
    setFormLoaded(true);
  }, []);

  const toggleSignUp = () => setActiveForm('signUp');
  const toggleSignIn = () => setActiveForm('signIn');
  const toggleForgotPassword = () => setActiveForm('forgotPassword');

  if (!formLoaded) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      {/* Hero section with logo and slogan */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            
            {/* Logo and brand */}
            <div className="flex flex-col items-center mb-8">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0284c7" className="h-16 w-16">
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.674 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">Soteria</h1>
              <p className="text-lg text-center text-gray-600 dark:text-gray-300 mt-2">...every second counts.</p>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2 mb-6">
                Personal safety and threat monitoring app
              </p>
            </div>
            
            {/* Auth forms */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
              {activeForm === 'signIn' && (
                <SignIn toggleSignUp={toggleSignUp} toggleForgotPassword={toggleForgotPassword} />
              )}
              
              {activeForm === 'signUp' && (
                <SignUp toggleSignIn={toggleSignIn} />
              )}
              
              {activeForm === 'forgotPassword' && (
                <ForgotPassword toggleSignIn={toggleSignIn} />
              )}
            </div>
            
            {/* Extra info */}
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                By using Soteria, you agree to our{' '}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy
                </a>
              </p>
              <p className="mt-4">
                ...every second counts.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>© 2025 Soteria Security. All rights reserved.</p>
            <p className="mt-1">...every second counts.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
