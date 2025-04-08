
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X, User, Bell, MapPin, Shield, AlertTriangle, Settings, PanelLeft, Users, Globe, CreditCard, LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  text: string;
  active: boolean;
}

const NavLink = ({ to, icon: Icon, text, active }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors",
        active && "bg-accent/40 text-accent-foreground font-medium"
      )}
    >
      <Icon className="h-4 w-4 mr-2" />
      <span>{text}</span>
    </Link>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
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
  
  const links = [
    { to: '/dashboard', icon: PanelLeft, text: 'Dashboard' },
    { to: '/map', icon: MapPin, text: 'Threat Map' },
    { to: '/alerts', icon: AlertTriangle, text: 'Alerts' },
    { to: '/emergency', icon: Shield, text: 'Emergency' },
    { to: '/family', icon: Users, text: 'Family Safety' },
    { to: '/travel', icon: Globe, text: 'Travel' },
    { to: '/cyber', icon: Shield, text: 'Cyber Security' },
    { to: '/subscription', icon: CreditCard, text: 'Subscription' },
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
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex flex-col h-screen">
            <div className="flex items-center justify-between px-4 h-14 border-b">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0284c7" className="h-6 w-6">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
                <span className="font-bold text-xl">Soteria</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <nav className="flex flex-col space-y-1">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    text={link.text}
                    active={isActive(link.to)}
                  />
                ))}
                
                <div className="pt-4 mt-4 border-t">
                  <NavLink
                    to="/notifications"
                    icon={Bell}
                    text="Notifications"
                    active={isActive('/notifications')}
                  />
                  <NavLink
                    to="/profile"
                    icon={User}
                    text="Profile"
                    active={isActive('/profile')}
                  />
                  <NavLink
                    to="/settings"
                    icon={Settings}
                    text="Settings"
                    active={isActive('/settings')}
                  />
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
