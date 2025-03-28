
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import ThreatsCard from '@/components/ui/ThreatsCard';
import { Button } from '@/components/ui/button';
import { Shield, Bell, ArrowRight, Globe, FileText, Lock, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { threatService } from '@/services/threatService';
import { useThreatNotifications } from '@/hooks/use-threat-notifications';
import { ThreatAlert } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { addThreat } = useThreatNotifications();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch real threat data if user is authenticated
    const fetchThreats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const threats = await threatService.getRecentThreats(user.id);
        setThreatAlerts(threats);
      } catch (error) {
        console.error('Failed to fetch threats:', error);
        toast({
          title: "Error",
          description: "Failed to load threat data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchThreats();
    
    // If no threats exist yet, create some sample threats for new users
    const createSampleThreats = async () => {
      if (!user || !loading || threatAlerts.length > 0) return;
      
      // Wait a bit to simulate real data loading
      setTimeout(async () => {
        if (threatAlerts.length === 0) {
          try {
            // Create sample threats
            await addThreat({
              title: 'Suspicious Login Attempt',
              description: 'Someone tried to log into your account from an unrecognized device in Moscow, Russia.',
              level: 'high',
              action: 'Secure Account'
            });
            
            await addThreat({
              title: 'High Crime Area Alert',
              description: 'You are entering an area with recent reports of mugging incidents.',
              level: 'medium',
              action: 'View Safe Routes'
            });
            
            await addThreat({
              title: 'Weather Advisory',
              description: 'Flash flood warning in your current location for the next 24 hours.',
              level: 'low',
              action: 'See Details'
            });
            
            // Refresh the threats list
            fetchThreats();
          } catch (error) {
            console.error('Error creating sample threats:', error);
          }
        }
      }, 2000);
    };
    
    createSampleThreats();
    
  }, [user, loading]);

  // Handle resolving a threat
  const handleResolveThreat = async (threatId: string) => {
    if (!user) return;
    
    try {
      await threatService.resolveThreat(threatId, user.id);
      // Remove the resolved threat from the UI
      setThreatAlerts(prev => prev.filter(threat => threat.id !== threatId));
      
      toast({
        title: "Threat Resolved",
        description: "The security threat has been resolved.",
      });
    } catch (error) {
      console.error('Failed to resolve threat:', error);
      toast({
        title: "Error",
        description: "Failed to resolve the threat",
        variant: "destructive",
      });
    }
  };

  // Calculate security score based on active threats
  const calculateSecurityScore = () => {
    if (threatAlerts.length === 0) return 100;
    
    const threatWeights = { high: 10, medium: 5, low: 2 };
    const totalThreats = threatAlerts.length;
    const threatScore = threatAlerts.reduce((score, threat) => 
      score + (threatWeights[threat.level] || 0), 0);
    
    return Math.max(0, 100 - threatScore);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-fade-in">
      {/* Header section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Security Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          AI-powered protection is actively monitoring your digital and physical safety.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { 
            title: 'Security Score', 
            value: `${calculateSecurityScore()}`, 
            icon: Shield, 
            color: 'text-primary', 
            description: calculateSecurityScore() > 90 
              ? 'Your protection status is excellent' 
              : calculateSecurityScore() > 70 
                ? 'Your protection status is good' 
                : 'Your protection needs attention'
          },
          { 
            title: 'Active Alerts', 
            value: `${threatAlerts.length}`, 
            icon: Bell, 
            color: 'text-threat-medium', 
            description: threatAlerts.length === 0 
              ? 'No active threats' 
              : `${threatAlerts.filter(t => t.level === 'high').length} high, ${threatAlerts.filter(t => t.level === 'medium').length} medium, ${threatAlerts.filter(t => t.level === 'low').length} low`
          },
          { 
            title: 'Protected Days', 
            value: user ? '1' : '0', 
            icon: Globe, 
            color: 'text-green-500', 
            description: 'Continuous protection streak' 
          },
        ].map((stat, index) => (
          <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium">{stat.title}</CardTitle>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl sm:text-3xl font-bold">{stat.value}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Threat alerts section */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Recent Threats</h2>
          <Link to="/threats">
            <Button variant="outline" size="sm" className="gap-1 text-xs sm:text-sm">
              <span>View all</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-muted"></div>
                    <div className="h-4 w-32 rounded-md bg-muted"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 w-full rounded-md bg-muted mb-2"></div>
                  <div className="h-3 w-3/4 rounded-md bg-muted"></div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="h-5 w-20 rounded-full bg-muted"></div>
                    <div className="h-3 w-12 rounded-md bg-muted"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : threatAlerts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {threatAlerts.map((alert) => (
              <ThreatsCard
                key={alert.id}
                title={alert.title}
                description={alert.description}
                level={alert.level}
                time={new Date(alert.created_at).toLocaleString()}
                action={alert.action || undefined}
                onAction={() => handleResolveThreat(alert.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No active threats detected</p>
            <p className="text-sm text-muted-foreground mt-2">Your security status is currently clear</p>
          </Card>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[
            { title: 'Scan Device', icon: FileText, href: '/security', color: 'bg-blue-500' },
            { title: 'View Map', icon: Map, href: '/map', color: 'bg-purple-500' }, 
            { title: 'Identity Protection', icon: Lock, href: '/security', color: 'bg-green-500' },
            { title: 'Emergency SOS', icon: Bell, href: '/emergency', color: 'bg-red-500' },
          ].map((action, index) => (
            <Link key={index} to={action.href} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                  <div className={cn("p-2 sm:p-3 rounded-full mb-2 sm:mb-3", action.color, action.title === 'Emergency SOS' ? 'animate-pulse-threat' : '')}>
                    <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">{action.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
