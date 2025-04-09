
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [notificationShown, setNotificationShown] = useState(false);
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Always bypass authentication in testing mode
  if (!user) {
    // Log the issue for easier debugging
    console.log("TEST MODE: Bypassing authentication for protected route");
    
    // Show toast only once when entering protected route without auth
    if (!notificationShown) {
      toast({
        title: "Testing Mode Active",
        description: "Authentication bypassed for testing",
        variant: "default",
      });
      setNotificationShown(true);
    }
    
    // For test mode, always allow access to protected routes
    return <>{children}</>;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
