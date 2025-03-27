
import React from 'react';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className }: LayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className={cn(
        "flex-1 animate-fade-in w-full mx-auto",
        isMobile 
          ? "px-4 py-4 max-w-md" 
          : "px-6 py-6 max-w-7xl",
        className
      )}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
