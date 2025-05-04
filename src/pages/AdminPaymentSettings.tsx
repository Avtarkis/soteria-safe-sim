
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PaymentIntegrationSettings from '@/components/admin/payment/PaymentIntegrationSettings';

const AdminPaymentSettings = () => {
  return (
    <AdminLayout>
      <PaymentIntegrationSettings />
    </AdminLayout>
  );
};

export default AdminPaymentSettings;
