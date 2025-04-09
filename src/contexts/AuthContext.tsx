
import React, { createContext, useContext } from 'react';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { useAuthMethods } from '@/hooks/auth/useAuthMethods';
import { useEmailVerification } from '@/hooks/auth/useEmailVerification';
import { AuthContextType } from '@/types/auth';

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our extracted hooks
  const { user, setUser, loading, setLoading } = useAuthState();
  const { signIn, signUp, signOut, resetPassword } = useAuthMethods(setUser);
  
  // Check for email verification parameters in URL
  useEmailVerification();

  // Create value object for the context
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
