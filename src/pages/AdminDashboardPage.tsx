
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminOverview from '@/components/admin/AdminOverview';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  
  // Check if user has admin privileges
  const isAdmin = user?.email?.endsWith('@soteria.com');
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminLayout>
      <AdminOverview />
    </AdminLayout>
  );
};

export default AdminDashboardPage;
