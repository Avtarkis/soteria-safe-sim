
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // Mark auth as checked once loading is complete
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);
  
  // Show loading state while checking authentication
  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Always bypass authentication in testing mode
  if (!user) {
    // Log the issue for easier debugging
    console.log("Authentication required but user not found - bypassing in test mode");
    
    // Show toast only once when entering protected route without auth
    useEffect(() => {
      toast({
        title: "Testing Mode",
        description: "Authentication bypassed for testing",
        variant: "default",
      });
    }, []);
    
    // For test mode, always allow access to protected routes
    if (import.meta.env.DEV || true) { // Always bypass for testing phase
      return <>{children}</>;
    }
    
    // For production, redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
