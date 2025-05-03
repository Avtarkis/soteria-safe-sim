
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { isStoreApp } from '@/utils/platformUtils';

const MainNav = () => {
  const location = useLocation();

  // Function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return true;
    }
    return location.pathname === path;
  };

  // Hide subscription link on store app versions
  const isStore = isStoreApp();

  return (
    <nav className="hidden md:flex items-center space-x-4 ml-6">
      <Link 
        to="/dashboard" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/dashboard') ? "text-primary" : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link 
        to="/map" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/map') ? "text-primary" : "text-muted-foreground"
        )}
      >
        Threat Map
      </Link>
      <Link 
        to="/alerts" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/alerts') ? "text-primary" : "text-muted-foreground"
        )}
      >
        Alerts
      </Link>
      <Link 
        to="/emergency" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/emergency') ? "text-primary" : "text-muted-foreground"
        )}
      >
        Emergency
      </Link>
      <Link 
        to="/family" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/family') ? "text-primary" : "text-muted-foreground"
        )}
      >
        Family
      </Link>
      <Link 
        to="/travel" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/travel') ? "text-primary" : "text-muted-foreground"
        )}
      >
        Travel
      </Link>
      <Link 
        to="/cyber" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/cyber') ? "text-primary" : "text-muted-foreground"
        )}
      >
        Cyber Security
      </Link>
      <Link 
        to="/support" 
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/support') ? "text-primary" : "text-muted-foreground"
        )}
      >
        Support
      </Link>
      
      {/* Hide subscription link on store app versions */}
      {!isStore && (
        <Link 
          to="/subscription" 
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            isActive('/subscription') ? "text-primary" : "text-muted-foreground"
          )}
        >
          Subscription
        </Link>
      )}
    </nav>
  );
};

export default MainNav;
