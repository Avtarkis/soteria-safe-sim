
import React, { useState } from 'react';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className={cn("flex-1 animate-fade-in px-4 sm:px-6 py-8", className)}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
