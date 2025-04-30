
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const [notificationShown, setNotificationShown] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  
  // Check if we're in development mode
  const isDevMode = import.meta.env.DEV;
  
  // Consider it admin for testing in development
  const hasAdminAccess = isAdmin || isDevMode;

  // Use useEffect to show toast outside of render, and only once
  useEffect(() => {
    if (isDevMode && !isAdmin && !notificationShown) {
      toast({
        title: "Dev Mode",
        description: "Admin access granted in development mode",
        variant: "default",
      });
      setNotificationShown(true);
    }
  }, [isAdmin, toast, notificationShown, isDevMode]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If user is logged in but not admin, redirect to dashboard
  if (!hasAdminAccess) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access the admin area",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is authenticated and has admin access
  return <>{children}</>;
};

export default AdminProtectedRoute;
