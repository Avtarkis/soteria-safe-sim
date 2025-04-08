
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { User, Bell, Shield as ShieldIcon, Phone, AlertTriangle, Zap, ArrowRight } from 'lucide-react';

interface QuickActionsSectionProps {
  handleRouteClick: (destination: string) => void;
}

const QuickActionsSection = ({ handleRouteClick }: QuickActionsSectionProps) => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <Card className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">Enable notifications for suspicious activity</span>
              <Zap className="h-4 w-4 text-green-500" />
            </li>
            <li className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">Enable two-factor authentication</span>
              <Zap className="h-4 w-4 text-green-500" />
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">Add trusted contacts for emergencies</span>
              <Zap className="h-4 w-4 text-yellow-500" />
            </li>
            <li className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">Notify contacts in case of a security breach</span>
              <Zap className="h-4 w-4 text-green-500" />
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Travel Advisory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">Safest routes to your saved locations:</p>
          <div className="mt-3 space-y-2">
            <button 
              className="w-full flex items-center justify-between p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              onClick={() => handleRouteClick('Home')}
            >
              <span className="text-sm">Home</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button 
              className="w-full flex items-center justify-between p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              onClick={() => handleRouteClick('Work')}
            >
              <span className="text-sm">Work</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActionsSection;
