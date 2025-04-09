
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType>({ isAdmin: false });

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Check if user has admin privileges
  // This centralizes the admin check logic in one place
  const isAdmin = Boolean(user?.email?.endsWith('@soteria.com'));
  
  return (
    <AdminContext.Provider value={{ isAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};
