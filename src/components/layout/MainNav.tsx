
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const MainNav = () => {
  return (
    <nav className="hidden md:flex items-center space-x-4 ml-6">
      <Link 
        to="/dashboard" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          window.location.pathname === '/dashboard' ? "text-primary" : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link 
        to="/threats" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          window.location.pathname === '/threats' ? "text-primary" : "text-muted-foreground"
        )}
      >
        Threat Map
      </Link>
      <Link 
        to="/emergency" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          window.location.pathname === '/emergency' ? "text-primary" : "text-muted-foreground"
        )}
      >
        Emergency
      </Link>
      <Link 
        to="/family" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          window.location.pathname === '/family' ? "text-primary" : "text-muted-foreground"
        )}
      >
        Family
      </Link>
    </nav>
  );
};

export default MainNav;
