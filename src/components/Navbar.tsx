
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Bell, Shield, Map, Lock, LifeBuoy, CreditCard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Shield },
  { label: 'Threat Map', href: '/map', icon: Map },
  { label: 'Security', href: '/security', icon: Lock },
  { label: 'Emergency', href: '/emergency', icon: LifeBuoy },
  { label: 'Subscription', href: '/subscription', icon: CreditCard },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 backdrop-blur-md",
        isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex justify-between items-center py-2 sm:py-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/lovable-uploads/fd116965-8e8a-49e6-8cd8-3c8032d4d789.png" alt="Soteria Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
              <span className="text-lg sm:text-xl font-semibold text-gradient">Soteria</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center space-x-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors">
              <User className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md text-foreground"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/90 backdrop-blur-md animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm sm:text-base font-medium text-foreground hover:bg-accent"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="pt-3 pb-2 sm:pt-4 sm:pb-3 border-t border-border">
            <div className="flex items-center px-4 sm:px-5">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-accent p-2" />
              </div>
              <div className="ml-3">
                <div className="text-sm sm:text-base font-medium">User</div>
                <div className="text-xs sm:text-sm text-muted-foreground">user@example.com</div>
              </div>
              <button className="ml-auto p-1.5 sm:p-2 rounded-full text-foreground hover:text-primary transition-colors">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
