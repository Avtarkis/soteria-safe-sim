
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminOverview from '@/components/admin/AdminOverview';

const AdminDashboardPage = () => {
  const { isAdmin } = useAdmin();
  
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
