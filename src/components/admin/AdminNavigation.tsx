
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, Shield, BarChart2, Settings, LogOut, LifeBuoy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const AdminNavigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const adminNavItems = [
    { icon: BarChart2, label: 'Overview', path: '/admin' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Shield, label: 'Threat Management', path: '/admin/threats' },
    { icon: LifeBuoy, label: 'Support Management', path: '/admin/support' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <>
      <div className="p-4 border-b">
        <Link to="/admin" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0284c7" className="h-8 w-8">
            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.674 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-bold text-xl">Soteria</div>
            <div className="text-xs text-muted-foreground">Admin Console</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t mt-auto">
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => signOut()}>
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  );
};

export default AdminNavigation;
