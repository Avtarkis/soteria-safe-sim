
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                <img src="/soteria-logo.png" alt="Soteria Logo" className="h-8 w-auto" />
                <span className="font-bold text-xl">Soteria</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/dashboard" 
                  className="block py-2 px-3 hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/map" 
                  className="block py-2 px-3 hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Threat Map
                </Link>
              </li>
              <li>
                <Link 
                  to="/alerts" 
                  className="block py-2 px-3 hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Alerts
                </Link>
              </li>
              <li>
                <Link 
                  to="/emergency" 
                  className="block py-2 px-3 hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Emergency
                </Link>
              </li>
              <li>
                <Link 
                  to="/family" 
                  className="block py-2 px-3 hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Family
                </Link>
              </li>
              <li>
                <Link 
                  to="/travel" 
                  className="block py-2 px-3 hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Travel
                </Link>
              </li>
              <li>
                <Link 
                  to="/cyber" 
                  className="block py-2 px-3 hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Cyber Security
                </Link>
              </li>
              <li>
                <Link 
                  to="/subscription" 
                  className="block py-2 px-3 hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Subscription
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className="block py-2 px-3 hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
              </li>
            </ul>
          </nav>
          <div className="p-4 border-t">
            {user ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
