
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import ThreatsCard from '@/components/ui/ThreatsCard';
import Button from '@/components/ui/Button';
import { Shield, Bell, ArrowRight, Globe, FileText, Lock, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreatAlert {
  id: string;
  title: string;
  description: string;
  level: 'low' | 'medium' | 'high';
  time: string;
  action?: string;
}

const Dashboard = () => {
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading threat data
    setTimeout(() => {
      setThreatAlerts([
        {
          id: '1',
          title: 'Suspicious Login Attempt',
          description: 'Someone tried to log into your account from an unrecognized device in Moscow, Russia.',
          level: 'high',
          time: 'Just now',
          action: 'Secure Account'
        },
        {
          id: '2',
          title: 'High Crime Area Alert',
          description: 'You are entering an area with recent reports of mugging incidents.',
          level: 'medium',
          time: '5 min ago',
          action: 'View Safe Routes'
        },
        {
          id: '3',
          title: 'Weather Advisory',
          description: 'Flash flood warning in your current location for the next 24 hours.',
          level: 'low',
          time: '1 hour ago',
          action: 'See Details'
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="container space-y-8 pb-10 animate-fade-in">
      {/* Header section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
        <p className="text-muted-foreground">
          AI-powered protection is actively monitoring your digital and physical safety.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Security Score', value: '92', icon: Shield, color: 'text-primary', description: 'Your protection status is excellent' },
          { title: 'Active Alerts', value: '3', icon: Bell, color: 'text-threat-medium', description: '1 high, 1 medium, 1 low threat' },
          { title: 'Protected Days', value: '64', icon: Globe, color: 'text-green-500', description: 'Continuous protection streak' },
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
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Threat alerts section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Threats</h2>
          <Link to="/threats">
            <Button variant="outline" size="sm" className="gap-1">
              <span>View all</span>
              <ArrowRight className="h-4 w-4" />
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
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {threatAlerts.map((alert, index) => (
              <ThreatsCard
                key={alert.id}
                title={alert.title}
                description={alert.description}
                level={alert.level}
                time={alert.time}
                action={alert.action}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Scan Device', icon: FileText, href: '/security', color: 'bg-blue-500' },
            { title: 'View Map', icon: Map, href: '/map', color: 'bg-purple-500' }, 
            { title: 'Identity Protection', icon: Lock, href: '/security', color: 'bg-green-500' },
            { title: 'Emergency SOS', icon: Bell, href: '/emergency', color: 'bg-red-500' },
          ].map((action, index) => (
            <Link key={index} to={action.href} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className={cn("p-3 rounded-full mb-3", action.color, action.title === 'Emergency SOS' ? 'animate-pulse-threat' : '')}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.title}</span>
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
