
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminThreatManagement } from '@/components/admin/AdminThreatManagement';

const AdminThreatsPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  
  // Consider it admin for testing in development
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
      <AdminThreatManagement />
    </AdminLayout>
  );
};

export default AdminThreatsPage;
