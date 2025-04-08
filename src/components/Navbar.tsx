import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, Home, Map, Bell, Shield, CreditCard, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
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
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
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
  const { user, signOut } = useAuth();
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
      description: "Loading page...",
      duration: 1500,
    });
  };

  // Generate navigation items
  const navItems = [
    { to: '/dashboard', icon: <Home className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Dashboard' },
    { to: '/map', icon: <Map className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Threat Map' },
    { to: '/family', icon: <Heart className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Family' },
    { to: '/emergency', icon: <Bell className={isMobile ? "h-5 w-5" : "h-4 w-4"} />, label: 'Emergency' },
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
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
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
