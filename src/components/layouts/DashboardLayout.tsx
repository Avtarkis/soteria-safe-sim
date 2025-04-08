
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layouts/Navbar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardLayout = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className={cn(
        "flex-1 animate-fade-in w-full mx-auto",
        isMobile 
          ? "px-4 py-4 max-w-md" 
          : "px-6 py-6 max-w-7xl"
      )}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
