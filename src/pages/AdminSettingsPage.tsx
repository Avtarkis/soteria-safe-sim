
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminSettingsManagement } from '@/components/admin/AdminSettingsManagement';

const AdminSettingsPage = () => {
  return (
    <AdminLayout>
      <AdminSettingsManagement />
    </AdminLayout>
  );
};

export default AdminSettingsPage;
