
import React from 'react';

const DashboardHeader = () => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <img src="/lovable-uploads/9daf588a-1d2e-48de-bc6b-39cec7926f8a.png" alt="Soteria Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <p className="text-sm sm:text-base text-muted-foreground">
        Welcome back. Here's your security status at a glance.
      </p>
    </div>
  );
};

export default DashboardHeader;
