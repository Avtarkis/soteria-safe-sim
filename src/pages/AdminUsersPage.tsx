
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';

const AdminUsersPage = () => {
  const { isAdmin } = useAdmin();
  
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
