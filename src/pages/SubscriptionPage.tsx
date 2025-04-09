
import React from 'react';

const SubscriptionPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Subscription</h1>
      <div className="grid gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <p className="text-muted-foreground">
            View details of your current subscription plan.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Upgrade Options</h2>
          <p className="text-muted-foreground">
            Explore premium features and subscription upgrades.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Billing History</h2>
          <p className="text-muted-foreground">
            Access your billing history and payment information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
