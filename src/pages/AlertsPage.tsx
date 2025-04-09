
import React from 'react';

const AlertsPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Alerts</h1>
      <div className="grid gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
          <p className="text-muted-foreground">
            View and manage your recent safety alerts.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Alert Settings</h2>
          <p className="text-muted-foreground">
            Customize your alert preferences and notification settings.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Alert History</h2>
          <p className="text-muted-foreground">
            Access your full history of safety alerts and notifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
