
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';

const AdminUsersPage = () => {
  const { user } = useAuth();
  
  // Check if user has admin privileges
  const isAdmin = user?.email?.endsWith('@soteria.com');
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminLayout>
      <AdminUserManagement />
    </AdminLayout>
  );
};

export default AdminUsersPage;
