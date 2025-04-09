
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminThreatManagement } from '@/components/admin/AdminThreatManagement';

const AdminThreatsPage = () => {
  const { user } = useAuth();
  
  // Check if user has admin privileges
  const isAdmin = user?.email?.endsWith('@soteria.com');
  
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
