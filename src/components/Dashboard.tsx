
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, ChevronRight, CreditCard, Map, ListChecks, User, Bell, Shield as ShieldIcon, Zap, Phone } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { threatService } from '@/services/threatService';
import { cn } from '@/lib/utils';

const threatLevelStyles = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const Dashboard = () => {
  const [recentThreats, setRecentThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentThreats = async () => {
      setLoading(true);
      try {
        const userId = 'user-id';
        const threats = await threatService.getRecentThreats(userId);
        setRecentThreats(threats);
      } catch (error) {
        console.error('Error fetching recent threats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load recent threats. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecentThreats();
  }, [toast]);

  const handleRouteClick = (destination: string) => {
    toast({
      title: `Safe Route to ${destination}`,
      description: `Calculating the safest route to your ${destination.toLowerCase()} location...`,
    });
    
    // Simulate route calculation
    setTimeout(() => {
      toast({
        title: `Route Found`,
        description: `The safest route to your ${destination.toLowerCase()} has been calculated. Redirecting to map view...`,
      });
      
      // Navigate to map with predefined destination
      navigate(`/map?destination=${destination.toLowerCase()}`);
    }, 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <img src="/soteria-logo.png" alt="Soteria Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome back. Here's your security status at a glance.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Overall Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Your system is well-protected. Keep monitoring for potential threats.
            </div>
            <Progress value={85} className="mt-4" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              Financial Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Monitor your financial accounts and transactions for any suspicious activity.
            </div>
            <Progress value={60} className="mt-4" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Threat Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Real-time threat analysis and alerts to keep you informed of potential risks.
            </div>
            <Progress value={40} className="mt-4" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/activity">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground">Loading recent activity...</div>
            ) : recentThreats.length > 0 ? (
              recentThreats.map((threat) => (
                <div key={threat.id} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{threat.title}</p>
                    <p className="text-xs text-muted-foreground">{threat.description}</p>
                  </div>
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", threatLevelStyles[threat.level])}>
                    {threat.level}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">No recent activity found.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Map className="h-5 w-5" />
              Threat Map
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/map">
                View Map
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Explore real-time threat locations and potential risks in your area.
            </div>
            <div className="aspect-w-16 aspect-h-9 mt-4 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src="/lovable-uploads/fd116965-8e8a-49e6-8cd8-3c8032d4d789.png"
                alt="Threat Map Preview"
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.src = "https://source.unsplash.com/random/600x337?map";
                }}
              />
              {/* Smaller Soteria logo overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <img 
                  src="/soteria-logo.png" 
                  alt="Soteria Logo" 
                  className="h-6 w-6 opacity-80" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};

export default Dashboard;
