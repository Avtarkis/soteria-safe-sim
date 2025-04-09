import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, User, Bell, MapPin, Shield, AlertTriangle, Settings, PanelLeft, Users, Globe, CreditCard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import NavLink from '@/components/navigation/NavLink';
import MobileNavMenu from '@/components/navigation/MobileNavMenu';
import { NavItemType } from '@/types/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Check if user has admin privileges
  const isAdmin = user?.email?.endsWith('@soteria.com');
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const isActive = (path: string) => {
    // Check if we're on the dashboard and the path is / or /dashboard
    if ((path === '/' || path === '/dashboard') && 
        (location.pathname === '/' || location.pathname === '/dashboard')) {
      return true;
    }
    
    // Otherwise do a normal path check
    return location.pathname === path;
  };
  
  const links: NavItemType[] = [
    { to: '/dashboard', icon: PanelLeft, text: 'Dashboard' },
    { to: '/map', icon: MapPin, text: 'Threat Map' },
    { to: '/alerts', icon: AlertTriangle, text: 'Alerts' },
    { to: '/emergency', icon: Shield, text: 'Emergency' },
    { to: '/family', icon: Users, text: 'Family Safety' },
    { to: '/travel', icon: Globe, text: 'Travel' },
    { to: '/cyber', icon: Shield, text: 'Cyber Security' },
    { to: '/subscription', icon: CreditCard, text: 'Subscription' },
    // Add Admin link if user is admin
    ...(isAdmin ? [{ to: '/admin', icon: Settings, text: 'Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0284c7" className="h-6 w-6">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
            <span className="font-bold text-xl">Soteria</span>
          </Link>
          <div className="hidden md:flex items-center">
            <div className="hidden md:flex ml-6 space-x-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  text={link.text}
                  active={isActive(link.to)}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden sm:flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(isActive('/notifications') && "bg-accent/40")}
            >
              <Link to="/notifications">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(isActive('/profile') && "bg-accent/40")}
            >
              <Link to="/profile">
                <User className="h-4 w-4" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(isActive('/settings') && "bg-accent/40")}
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </div>
          
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <MobileNavMenu 
        isOpen={isOpen} 
        toggleMenu={toggleMenu} 
        links={links} 
        isActive={isActive} 
      />
    </header>
  );
};

export default Navbar;
