
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
        <Card className="w-full max-w-md">
          {view === 'signin' && <SignIn toggleSignUp={toggleSignUp} toggleForgotPassword={toggleForgotPassword} />}
          {view === 'signup' && <SignUp toggleSignIn={toggleSignIn} />}
          {view === 'forgot-password' && <ForgotPassword toggleSignIn={toggleSignIn} />}
        </Card>
      </div>
    </div>
  );
};

export default AuthScreen;
