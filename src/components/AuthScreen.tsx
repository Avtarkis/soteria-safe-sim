
import React, { useState } from 'react';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';
import ForgotPassword from '@/components/ForgotPassword';
import { Card } from '@/components/ui/card';

const AuthScreen = () => {
  const [view, setView] = useState<'signin' | 'signup' | 'forgot-password'>('signin');

  const toggleSignUp = () => setView('signup');
  const toggleSignIn = () => setView('signin');
  const toggleForgotPassword = () => setView('forgot-password');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="/lovable-uploads/9daf588a-1d2e-48de-bc6b-39cec7926f8a.png" alt="Soteria Logo" className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Soteria</h1>
          </div>
          <Card className="w-full">
            {view === 'signin' && <SignIn toggleSignUp={toggleSignUp} toggleForgotPassword={toggleForgotPassword} />}
            {view === 'signup' && <SignUp toggleSignIn={toggleSignIn} />}
            {view === 'forgot-password' && <ForgotPassword toggleSignIn={toggleSignIn} />}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
