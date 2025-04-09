
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import NavLink from './NavLink';
import { NavItemType } from '@/types/navigation';

interface MobileNavMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
  links: NavItemType[];
  isActive: (path: string) => boolean;
}

const MobileNavMenu = ({ isOpen, toggleMenu, links, isActive }: MobileNavMenuProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-background md:hidden">
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between px-4 h-14 border-b">
          <Link to="/" className="flex items-center space-x-2" onClick={toggleMenu}>
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
                onClick={toggleMenu}
              />
            ))}
            
            <div className="pt-4 mt-4 border-t">
              <NavLink
                to="/notifications"
                icon={require('lucide-react').Bell}
                text="Notifications"
                active={isActive('/notifications')}
                onClick={toggleMenu}
              />
              <NavLink
                to="/profile"
                icon={require('lucide-react').User}
                text="Profile"
                active={isActive('/profile')}
                onClick={toggleMenu}
              />
              <NavLink
                to="/settings"
                icon={require('lucide-react').Settings}
                text="Settings"
                active={isActive('/settings')}
                onClick={toggleMenu}
              />
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileNavMenu;
