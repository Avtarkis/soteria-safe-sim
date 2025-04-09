
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, Home, Map, Bell, Shield, CreditCard, User, Heart, AlertTriangle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext'; // Using the correct context
import { ThemeToggle } from '@/components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Extract NavItem component to make code more modular
const NavItem = ({ to, icon, label, active, loading, onClick }: { 
  to: string; 
  icon: React.ReactNode; 
  label: string;
  active: boolean;
  loading: boolean;
  onClick: () => void;
}) => {
  const isCurrentlyLoading = loading && active;
  
  return (
    <button
      onClick={onClick}
      disabled={isCurrentlyLoading}
      className={cn(
        "flex items-center gap-4 py-2 px-4 transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg w-full text-left",
        active ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground',
        isCurrentlyLoading && 'opacity-70 cursor-not-allowed'
      )}
    >
      {icon}
      <span>{label}</span>
      {isCurrentlyLoading && (
        <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
    </button>
  );
};

// Extract MobileMenu component
const MobileMenu = ({ open, setOpen, navItems, user, signOut }: {
  open: boolean;
  setOpen: (open: boolean) => void;
  navItems: {
    to: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
  }[];
  user: any;
  signOut: () => Promise<void>;
}) => {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="ml-auto">
        <Button variant="outline" size="icon">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6 mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0284c7" className="h-8 w-8">
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.674 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-lg">Soteria</span>
          </div>
          <div className="space-y-1 flex-1">
            {navItems.map((item) => (
              <NavItem 
                key={item.to}
                to={item.to} 
                icon={item.icon} 
                label={item.label} 
                active={item.active} 
                loading={false} 
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }} 
              />
            ))}
          </div>
          {user && (
            <div className="mt-auto mb-6 space-y-4">
              <div className="border-t pt-4 space-y-4">
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="flex items-center gap-4 py-2 px-4 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 w-full"
                >
                  <User className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
          <div className="border-t pt-4 pb-2">
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Extract DesktopMenu component
const DesktopMenu = ({ navItems }: {
  navItems: {
    to: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
  }[];
}) => {
  return (
    <div className="flex-1 ml-8">
      <nav className="flex items-center gap-6">
        {navItems.map((item) => (
          <button 
            key={item.to}
            onClick={item.onClick} 
            className={cn(
              "flex items-center gap-2 py-2 px-3 transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg",
              item.active ? 'bg-accent/50 text-accent-foreground font-medium' : 'text-muted-foreground'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth(); // Using the correct auth context
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Clean up loading state if navigation gets stuck
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleNavigation = (path: string) => {
    // Set loading state
    setIsLoading(true);
    
    // Navigate to the path with a small delay to allow UI to update
    setTimeout(() => {
      navigate(path);
      
      // Clear loading state after navigation
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }, 100);
    
    // Show toast for navigation feedback
    toast({
      title: `Navigating to ${path.slice(1).charAt(0).toUpperCase() + path.slice(2)}`,
      description: "Where every second counts - loading page...",
      duration: 1500,
    });
  };

  // Generate navigation items - updated to match routes in App.tsx
  const navItems = [
    { to: '/dashboard', icon: <Home className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Dashboard' },
    { to: '/map', icon: <Map className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Threat Map' },
    { to: '/alerts', icon: <AlertTriangle className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Alerts' },
    { to: '/emergency', icon: <Bell className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Emergency' },
    { to: '/family', icon: <Heart className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Family' },
    { to: '/travel', icon: <Globe className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Travel' },
    { to: '/cyber', icon: <Shield className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Cyber Security' },
    { to: '/subscription', icon: <CreditCard className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Subscription' },
  ].map(item => ({
    ...item,
    active: location.pathname === item.to,
    onClick: () => handleNavigation(item.to)
  }));

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0284c7" className="h-8 w-8">
            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.674 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold text-lg">Soteria</span>
        </div>

        {isMobile ? (
          <MobileMenu 
            open={open} 
            setOpen={setOpen} 
            navItems={navItems} 
            user={user} 
            signOut={signOut} 
          />
        ) : (
          <DesktopMenu navItems={navItems} />
        )}

        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          {user && !isMobile && (
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
