
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [notificationShown, setNotificationShown] = useState(false);
  
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
      // Log the issue for easier debugging
      console.log("TEST MODE: Bypassing authentication for protected route");
      
      // Show toast only once when entering protected route without auth
      toast({
        title: "Testing Mode Active",
        description: "Authentication bypassed for testing",
        variant: "default",
      });
      setNotificationShown(true);
    }
  }, [user, toast, notificationShown]);
  
  // Always bypass authentication in testing mode
  console.log("Test mode: allowing access to protected route without authentication");
  return <>{children}</>;
};

export default ProtectedRoute;
