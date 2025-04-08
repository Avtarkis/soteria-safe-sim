
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Shield,
  Map,
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Home,
  Globe,
  AlertTriangle,
  PhoneCall,
  Users,
  Lock,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Threat Map', path: '/map', icon: <Map className="h-5 w-5" /> },
    { name: 'Alerts', path: '/alerts', icon: <AlertTriangle className="h-5 w-5" /> },
    { name: 'Emergency', path: '/emergency', icon: <PhoneCall className="h-5 w-5" /> },
    { name: 'Family Safety', path: '/family', icon: <Users className="h-5 w-5" /> },
    { name: 'Travel', path: '/travel', icon: <Globe className="h-5 w-5" /> },
    { name: 'Cyber Security', path: '/cyber', icon: <Lock className="h-5 w-5" /> },
    { name: 'Subscription', path: '/subscription', icon: <CreditCard className="h-5 w-5" /> },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-background dark:bg-background border-b border-border flex justify-between items-center px-4 py-2 lg:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button variant="ghost" size="sm" className="lg:hidden" onClick={toggleMenu}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden md:inline-block">Soteria</span>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NavLink to="/notifications">
          <Button variant="ghost" size="sm" className="px-2">
            <Bell className="h-5 w-5" />
          </Button>
        </NavLink>
        <NavLink to="/settings">
          <Button variant="ghost" size="sm" className="px-2">
            <Settings className="h-5 w-5" />
          </Button>
        </NavLink>
        <NavLink to="/profile">
          <Button variant="ghost" size="sm" className="px-2">
            <User className="h-5 w-5" />
          </Button>
        </NavLink>
        <Button variant="ghost" size="sm" className="px-2" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile navigation */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[57px] z-50 bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col space-y-2 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 p-2 rounded-md",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
