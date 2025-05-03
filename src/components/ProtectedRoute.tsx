
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isTestMode } from '@/utils/auth';
import { isStoreApp } from '@/utils/platformUtils';
import useSubscriptionStatus from '@/hooks/useSubscriptionStatus';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [notificationShown, setNotificationShown] = useState(false);
  const location = useLocation();
  const { hasActiveSubscription, isLoading: subscriptionLoading } = useSubscriptionStatus();
  
  // Always call hooks at the top level - never conditionally
  
  // Use useEffect to show toast outside of render, and only once
  useEffect(() => {
    if (!user && !notificationShown && isTestMode()) {
      // Show toast only once when entering protected route without auth in test mode
      toast({
        title: "Testing Mode Active",
        description: "Authentication bypassed for testing",
        variant: "default",
      });
      setNotificationShown(true);
    }
  }, [user, toast, notificationShown]);

  // Show loading state while checking authentication and subscription
  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if we're on a store app and user has an active subscription
  if (isStoreApp() && !hasActiveSubscription && !isTestMode()) {
    // Redirect to special screen for store apps without subscription
    return <Navigate to="/subscribe-required" state={{ from: location }} replace />;
  }

  // If not in test mode, check if user is authenticated
  if (!user && !isTestMode()) {
    // Redirect to login page, but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated or in test mode, show the protected route
  return <>{children}</>;
};

export default ProtectedRoute;
