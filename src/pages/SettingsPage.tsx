
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import LogoDownloader from '@/components/ui/LogoDownloader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Globe, Lock, Settings, Shield, Sun, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Settings state
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    emergencyAlerts: true,
    securityAlerts: true,
    travelAlerts: false,
  });
  const [language, setLanguage] = useState('english');
  const [units, setUnits] = useState('imperial');
  
  // Form state
  const [loading, setLoading] = useState(false);
  
  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    }, 800);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
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
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch 
                checked={notifications.email} 
                onCheckedChange={(checked) => setNotifications({...notifications, email: checked})} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
              </div>
              <Switch 
                checked={notifications.push} 
                onCheckedChange={(checked) => setNotifications({...notifications, push: checked})} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Emergency Alerts</p>
                <p className="text-sm text-muted-foreground">Critical safety information</p>
              </div>
              <Switch 
                checked={notifications.emergencyAlerts} 
                onCheckedChange={(checked) => setNotifications({...notifications, emergencyAlerts: checked})} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-muted-foreground">Account and safety notifications</p>
              </div>
              <Switch 
                checked={notifications.securityAlerts} 
                onCheckedChange={(checked) => setNotifications({...notifications, securityAlerts: checked})} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Travel Advisories</p>
                <p className="text-sm text-muted-foreground">Travel safety information</p>
              </div>
              <Switch 
                checked={notifications.travelAlerts} 
                onCheckedChange={(checked) => setNotifications({...notifications, travelAlerts: checked})} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Privacy & Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Location Tracking</p>
              <p className="text-sm text-muted-foreground">Share your location for emergency services</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Data Sharing</p>
              <p className="text-sm text-muted-foreground">Allow anonymous data to improve services</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="pt-2">
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Globe className="h-5 w-5" />
          <CardTitle>Regional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select 
                id="language" 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="units">Measurement Units</Label>
              <select 
                id="units" 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              >
                <option value="imperial">Imperial (miles, °F)</option>
                <option value="metric">Metric (kilometers, °C)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Sun className="h-5 w-5" />
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
            </div>
            <Switch 
              checked={darkMode} 
              onCheckedChange={setDarkMode} 
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Soteria Logo</h3>
            <p className="text-sm text-muted-foreground mb-4">Download the Soteria logo for your use</p>
            <div className="flex items-center gap-4">
              <img src="/logo.svg" alt="Soteria Logo" className="h-12 w-12" />
              <LogoDownloader />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Advanced</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">High Precision Location</p>
                <p className="text-sm text-muted-foreground">Uses more battery but improves accuracy</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Clear App Data</p>
                <p className="text-sm text-muted-foreground">Remove all local application data</p>
              </div>
              <Button variant="outline" size="sm">Clear Data</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export Personal Data</p>
                <p className="text-sm text-muted-foreground">Download all your data in JSON format</p>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground pb-8">
        <p>Soteria Security App • Version 1.0.4</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Help Center</a>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
