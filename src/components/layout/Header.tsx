
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/shared/Logo';
import MobileMenu from '@/components/layout/MobileMenu';
import UserMenu from '@/components/layout/UserMenu';
import MainNav from '@/components/layout/MainNav';

const Header = () => {
  const { user } = useAuth();
  // Check if user exists to determine authentication status
  const isAuthenticated = !!user;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <img src="/soteria-logo.png" alt="Soteria Logo" className="h-8 w-auto" />
          <span className="font-bold text-xl hidden sm:inline-block">Soteria</span>
        </div>
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link to="/login" className="text-sm font-medium">
                Sign In
              </Link>
            )}
            <MobileMenu />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
