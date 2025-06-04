
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  adminLevel: 'none' | 'basic' | 'full';
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLevel, setAdminLevel] = useState<'none' | 'basic' | 'full'>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return;
      
      setLoading(true);
      
      try {
        if (user) {
          // In a real app, this would check user roles from the database
          // For now, we'll use email-based admin detection for testing
          const adminEmails = ['admin@soteria.com', 'test@admin.com'];
          const userIsAdmin = adminEmails.includes(user.email || '');
          
          setIsAdmin(userIsAdmin);
          setAdminLevel(userIsAdmin ? 'full' : 'none');
        } else {
          setIsAdmin(false);
          setAdminLevel('none');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminLevel('none');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  const value = {
    isAdmin,
    loading,
    adminLevel
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
