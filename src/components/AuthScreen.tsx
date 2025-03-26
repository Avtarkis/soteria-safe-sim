
import React, { useState } from 'react';
import Button from './ui/Button';
import { Shield, Mail, Key, User, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (isSignUp && step < 2) {
        setStep(step + 1);
      } else {
        window.location.href = '/dashboard';
      }
    }, 1500);
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <img src="/logo.svg" alt="Soteria Logo" className="h-16 w-16 animate-float" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gradient">SOTERIA</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Advanced AI-driven threat prevention
          </p>
        </div>

        <div className="bg-card shadow-lg rounded-2xl p-8 mb-6 animate-scale-in">
          <h2 className="text-xl font-semibold mb-6">
            {isSignUp 
              ? (step === 1 ? "Create an account" : "Setup your profile") 
              : "Welcome back"}
          </h2>

          <form onSubmit={handleSubmit}>
            {isSignUp ? (
              <>
                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="email">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <input
                          id="email"
                          type="email"
                          className="w-full pl-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="password">
                        Password
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          className="w-full pl-10 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="fullName">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <input
                          id="fullName"
                          type="text"
                          className="w-full pl-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Threat Detection Preferences
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Cyber', 'Physical', 'Environmental'].map((type) => (
                          <label 
                            key={type}
                            className="flex items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                          >
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              defaultChecked 
                            />
                            <span className="text-sm">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="loginEmail">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      id="loginEmail"
                      type="email"
                      className="w-full pl-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium" htmlFor="loginPassword">
                      Password
                    </label>
                    <button type="button" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full mt-6 py-2 rounded-lg flex items-center justify-center"
              isLoading={loading}
            >
              <span>
                {isSignUp 
                  ? (step === 1 ? "Continue" : "Complete Setup") 
                  : "Sign In"}
              </span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              className="ml-1 text-primary hover:underline font-medium"
              onClick={toggleForm}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
