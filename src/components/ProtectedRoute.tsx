
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
  
  // In development mode, we bypass authentication as it's simulated
  if (import.meta.env.DEV && !user) {
    // Log the issue for easier debugging
    console.log("Authentication bypassed in development mode");
    
    // Show toast only once when entering protected route without auth in dev mode
    useEffect(() => {
      toast({
        title: "Dev Mode",
        description: "Authentication bypassed for development",
        variant: "default",
      });
    }, []);
    
    return <>{children}</>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
