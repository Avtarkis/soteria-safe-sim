
import React from 'react';

const CyberSecurityPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Cyber Security</h1>
      <div className="grid gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Threat Detection</h2>
          <p className="text-muted-foreground">
            Monitor and detect cyber threats to your personal data.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Password Manager</h2>
          <p className="text-muted-foreground">
            Securely store and manage your passwords.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Privacy Protection</h2>
          <p className="text-muted-foreground">
            Tools and tips to protect your online privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CyberSecurityPage;
