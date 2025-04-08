
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScreen from '@/components/AuthScreen';
import SignIn from '@/components/SignIn';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const Index = () => {
  const [showDummyAuth, setShowDummyAuth] = useState(false);
  
  // Toggle between standard auth screen and dummy auth
  const toggleAuth = () => {
    setShowDummyAuth(prev => !prev);
  };
  
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen p-4">
      {showDummyAuth ? (
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0284c7" className="h-16 w-16">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold">Soteria</h1>
              <p className="text-muted-foreground mt-2">Where every second counts.</p>
            </CardHeader>
            <CardContent>
              <SignIn toggleSignUp={() => {}} toggleForgotPassword={() => {}} />
              <div className="mt-4 text-center">
                <button onClick={toggleAuth} className="text-sm text-primary hover:underline">
                  Return to standard login
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <AuthScreen />
          <div className="mt-8">
            <button onClick={toggleAuth} className="text-sm text-primary hover:underline">
              Try dummy authentication mode
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
