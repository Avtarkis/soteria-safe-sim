
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, Home, Map, Bell, Shield, CreditCard, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isMobile } = useMobile();

  const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-4 py-2 px-4 transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg ${
            isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
          }`
        }
        onClick={() => setOpen(false)}
      >
        {icon}
        <span>{label}</span>
      </NavLink>
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
              <NavItem to="/dashboard" icon={<Home className="h-4 w-4" />} label="Dashboard" />
              <NavItem to="/map" icon={<Map className="h-4 w-4" />} label="Threat Map" />
              <NavItem to="/family" icon={<Heart className="h-4 w-4" />} label="Family" />
              <NavItem to="/emergency" icon={<Bell className="h-4 w-4" />} label="Emergency" />
              <NavItem to="/cyber" icon={<Shield className="h-4 w-4" />} label="Cyber Security" />
              <NavItem to="/subscription" icon={<CreditCard className="h-4 w-4" />} label="Subscription" />
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
