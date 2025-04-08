
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('securetravel_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('securetravel_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API request delay
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, just create a user with the email
    const demoUser = {
      id: 'user-' + Date.now(),
      name: email.split('@')[0],
      email
    };
    
    setUser(demoUser);
    localStorage.setItem('securetravel_user', JSON.stringify(demoUser));
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, name: string) => {
    // Simulate API request delay
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, just create a user with the provided details
    const newUser = {
      id: 'user-' + Date.now(),
      name,
      email
    };
    
    setUser(newUser);
    localStorage.setItem('securetravel_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('securetravel_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
