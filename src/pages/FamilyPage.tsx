
import React from 'react';

const FamilyPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Family Safety</h1>
      <div className="grid gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Family Location Tracking</h2>
          <p className="text-muted-foreground">
            Monitor the location of your family members in real-time.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Safety Alerts</h2>
          <p className="text-muted-foreground">
            Receive notifications when family members enter or leave designated safe zones.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Emergency Contacts</h2>
          <p className="text-muted-foreground">
            Manage emergency contacts for your family.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FamilyPage;
