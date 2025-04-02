import React, { useState } from 'react';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';
import ForgotPassword from '@/components/ForgotPassword';

const AuthScreen = () => {
  const [showSignIn, setShowSignIn] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const toggleSignIn = () => {
    setShowSignIn(true);
    setShowSignUp(false);
    setShowForgotPassword(false);
  };

  const toggleSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
    setShowForgotPassword(false);
  };

  const toggleForgotPassword = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    setShowForgotPassword(true);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <div className="flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 md:flex-row">
        <div className="flex-1 flex flex-col justify-center py-12 sm:py-16 md:py-24">
          <div className="mx-auto w-full max-w-md">
            <div className="flex items-center justify-center md:justify-start mb-6">
              <img src="/lovable-uploads/9daf588a-1d2e-48de-bc6b-39cec7926f8a.png" alt="Soteria Logo" className="h-12 w-12 mr-2" />
              <h1 className="text-2xl font-bold">Soteria</h1>
            </div>
            
            {showSignIn && <SignIn toggleSignUp={toggleSignUp} toggleForgotPassword={toggleForgotPassword} />}
            {showSignUp && <SignUp toggleSignIn={toggleSignIn} />}
            {showForgotPassword && <ForgotPassword toggleSignIn={toggleSignIn} />}
          </div>
        </div>
        
        <div className="relative hidden md:block md:w-1/2 bg-muted">
          <img
            src="/lovable-uploads/fd116965-8e8a-49e6-8cd8-3c8032d4d789.png"
            alt="Authentication Background"
            className="absolute inset-0 object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-primary/10" />
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
