
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, Home, Map, Bell, Shield, CreditCard, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Clean up loading state if navigation gets stuck
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleNavigation = (path: string) => {
    // Close mobile menu if open
    if (open) setOpen(false);
    
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

  const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
    const isActive = location.pathname === to;
    const isCurrentlyLoading = isLoading && to === location.pathname;
    
    return (
      <button
        onClick={() => handleNavigation(to)}
        disabled={isCurrentlyLoading}
        className={cn(
          "flex items-center gap-4 py-2 px-4 transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg w-full text-left",
          isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground',
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

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/9daf588a-1d2e-48de-bc6b-39cec7926f8a.png" 
            alt="Soteria Logo" 
            className="h-8 w-8" 
          />
          <span className="font-semibold text-lg">Soteria</span>
        </div>

        {isMobile ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="ml-auto">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-6 mt-4">
                  <img 
                    src="/lovable-uploads/9daf588a-1d2e-48de-bc6b-39cec7926f8a.png" 
                    alt="Soteria Logo" 
                    className="h-8 w-8" 
                  />
                  <span className="font-semibold text-lg">Soteria</span>
                </div>
                <div className="space-y-1 flex-1">
                  <NavItem to="/dashboard" icon={<Home className="h-5 w-5" />} label="Dashboard" />
                  <NavItem to="/map" icon={<Map className="h-5 w-5" />} label="Threat Map" />
                  <NavItem to="/family" icon={<Heart className="h-5 w-5" />} label="Family" />
                  <NavItem to="/emergency" icon={<Bell className="h-5 w-5" />} label="Emergency" />
                  <NavItem to="/cyber" icon={<Shield className="h-5 w-5" />} label="Cyber Security" />
                  <NavItem to="/subscription" icon={<CreditCard className="h-5 w-5" />} label="Subscription" />
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
        ) : (
          <div className="flex-1 ml-8">
            <nav className="flex items-center gap-6">
              <button 
                onClick={() => handleNavigation('/dashboard')} 
                className={cn(
                  "flex items-center gap-2 py-2 px-3 transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg",
                  location.pathname === '/dashboard' ? 'bg-accent/50 text-accent-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('/map')} 
                className={cn(
                  "flex items-center gap-2 py-2 px-3 transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg",
                  location.pathname === '/map' ? 'bg-accent/50 text-accent-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                <Map className="h-4 w-4" />
                <span>Threat Map</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('/family')} 
                className={cn(
                  "flex items-center gap-2 py-2 px-3 transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg",
                  location.pathname === '/family' ? 'bg-accent/50 text-accent-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                <Heart className="h-4 w-4" />
                <span>Family</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('/emergency')} 
                className={cn(
                  "flex items-center gap-2 py-2 px-3 transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg",
                  location.pathname === '/emergency' ? 'bg-accent/50 text-accent-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                <Bell className="h-4 w-4" />
                <span>Emergency</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('/cyber')} 
                className={cn(
                  "flex items-center gap-2 py-2 px-3 transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg",
                  location.pathname === '/cyber' ? 'bg-accent/50 text-accent-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                <Shield className="h-4 w-4" />
                <span>Cyber Security</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('/subscription')} 
                className={cn(
                  "flex items-center gap-2 py-2 px-3 transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg",
                  location.pathname === '/subscription' ? 'bg-accent/50 text-accent-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                <CreditCard className="h-4 w-4" />
                <span>Subscription</span>
              </button>
            </nav>
          </div>
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
