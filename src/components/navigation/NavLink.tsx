
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  text: string;
  active: boolean;
  onClick?: () => void;
}

const NavLink = ({ to, icon: Icon, text, active, onClick }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors",
        active && "bg-accent/40 text-accent-foreground font-medium"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 mr-2" />
      <span>{text}</span>
    </Link>
  );
};

export default NavLink;
