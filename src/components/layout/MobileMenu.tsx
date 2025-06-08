
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, Home, Map, Bell, Shield, CreditCard, User, Heart, AlertTriangle, Globe, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const NavItem = ({ to, icon, label, active, onClick }: { 
  to: string; 
  icon: React.ReactNode; 
  label: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 py-2 px-4 transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg w-full text-left",
        active ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  if (!isMobile) return null;

  const navItems = [
    { to: '/dashboard', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
    { to: '/map', icon: <Map className="h-5 w-5" />, label: 'Threat Map' },
    { to: '/alerts', icon: <AlertTriangle className="h-5 w-5" />, label: 'Alerts' },
    { to: '/emergency', icon: <Bell className="h-5 w-5" />, label: 'Emergency' },
    { to: '/family', icon: <Heart className="h-5 w-5" />, label: 'Family' },
    { to: '/travel', icon: <Globe className="h-5 w-5" />, label: 'Travel' },
    { to: '/cyber', icon: <Shield className="h-5 w-5" />, label: 'Cyber Security' },
    { to: '/support', icon: <LifeBuoy className="h-5 w-5" />, label: 'Support Center' },
    { to: '/subscription', icon: <CreditCard className="h-5 w-5" />, label: 'Subscription' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
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
                active={location.pathname === item.to} 
                onClick={() => setOpen(false)} 
              />
            ))}
          </div>
          {user && (
            <div className="mt-auto mb-6 space-y-4">
              <div className="border-t pt-4 space-y-4">
                <button
                  onClick={async () => {
                    await signOut();
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

export default MobileMenu;
