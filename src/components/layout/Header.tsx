
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/components/ui/logo';
import UserMenu from './UserMenu';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link to="/" className="items-center space-x-2 flex">
            <Logo />
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link 
              to="/map" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Threat Map
            </Link>
            <Link 
              to="/travel" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Safe Travel
            </Link>
            <Link 
              to="/dashboard" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign up
                  </Button>
                </Link>
              </>
            ) : (
              <UserMenu user={user} />
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
