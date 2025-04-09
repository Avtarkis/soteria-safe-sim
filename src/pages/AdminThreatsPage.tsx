
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminThreatManagement } from '@/components/admin/AdminThreatManagement';

const AdminThreatsPage = () => {
  const { isAdmin } = useAdmin();
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminLayout>
      <AdminThreatManagement />
    </AdminLayout>
  );
};

export default AdminThreatsPage;
