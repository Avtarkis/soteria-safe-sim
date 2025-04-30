
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminOverview from '@/components/admin/AdminOverview';

const AdminDashboardPage = () => {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
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
  
  // In development mode, bypass authentication check
  const hasAdminAccess = isAdmin || import.meta.env.DEV;
  
  // Redirect non-admin users
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasAdminAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminLayout>
      <AdminOverview />
    </AdminLayout>
  );
};

export default AdminDashboardPage;
