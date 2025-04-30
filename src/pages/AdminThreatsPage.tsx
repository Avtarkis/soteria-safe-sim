
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminThreatManagement } from '@/components/admin/AdminThreatManagement';

const AdminThreatsPage = () => {
  return (
    <AdminLayout>
      <AdminThreatManagement />
    </AdminLayout>
  );
};

export default AdminThreatsPage;
