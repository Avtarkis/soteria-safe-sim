
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';

const AdminUsersPage = () => {
  return (
    <AdminLayout>
      <AdminUserManagement />
    </AdminLayout>
  );
};

export default AdminUsersPage;
