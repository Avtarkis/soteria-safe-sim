
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AccountSettings = () => {
  const { user } = useAuth();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <User className="h-5 w-5" />
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={user?.email || ''} 
              disabled 
              className="bg-muted" 
            />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input 
              id="displayName" 
              placeholder="Your display name" 
              defaultValue={user?.email?.split('@')[0] || 'User'} 
            />
          </div>
        </div>
        
        <div className="pt-4">
          <Button variant="outline" className="text-destructive hover:text-destructive">
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
