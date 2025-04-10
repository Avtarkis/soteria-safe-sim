
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isTestMode } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [notificationShown, setNotificationShown] = useState(false);
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Use useEffect to show toast outside of render
  useEffect(() => {
    if (!user && !notificationShown) {
      // Show toast only once when entering protected route without auth
      if (isTestMode()) {
        console.log("TEST MODE: Bypassing authentication for protected route");
        toast({
          title: "Testing Mode Active",
          description: "Authentication bypassed for testing",
          variant: "default",
        });
      }
      setNotificationShown(true);
    }
  }, [user, toast, notificationShown]);

  // If not in test mode, check if user is authenticated
  if (!user && !isTestMode()) {
    // Redirect to login page, but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated or in test mode, show the protected route
  return <>{children}</>;
};

export default ProtectedRoute;
