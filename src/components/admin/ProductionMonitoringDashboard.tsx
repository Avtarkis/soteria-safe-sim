
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Activity, 
  Shield, 
  Eye, 
  Server, 
  Database, 
  Globe 
} from 'lucide-react';
import AlertSummaryCards from './monitoring/AlertSummaryCards';
import SystemStatusCard from './monitoring/SystemStatusCard';

interface SystemStatus {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  lastCheck: number;
  metrics?: {
    cpu?: number;
    memory?: number;
    requests?: number;
  };
}

const ProductionMonitoringDashboard = () => {
  const { toast } = useToast();
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([
    {
      service: 'Weapon Detection AI',
      status: 'healthy',
      uptime: 99.9,
      lastCheck: Date.now(),
      metrics: { cpu: 45, memory: 67, requests: 1247 }
    },
    {
      service: 'Emergency Services',
      status: 'healthy',
      uptime: 99.8,
      lastCheck: Date.now(),
      metrics: { cpu: 23, memory: 34, requests: 89 }
    },
    {
      service: 'Medical Sensors',
      status: 'warning',
      uptime: 98.5,
      lastCheck: Date.now() - 30000,
      metrics: { cpu: 78, memory: 85, requests: 567 }
    },
    {
      service: 'Live Streaming',
      status: 'healthy',
      uptime: 99.7,
      lastCheck: Date.now(),
      metrics: { cpu: 56, memory: 72, requests: 2134 }
    },
    {
      service: 'Payment Processing',
      status: 'healthy',
      uptime: 99.9,
      lastCheck: Date.now(),
      metrics: { cpu: 12, memory: 28, requests: 45 }
    },
    {
      service: 'Threat Detection',
      status: 'healthy',
      uptime: 99.6,
      lastCheck: Date.now(),
      metrics: { cpu: 34, memory: 56, requests: 890 }
    }
  ]);

  const [alertCounts, setAlertCounts] = useState({
    critical: 0,
    high: 2,
    medium: 5,
    low: 12
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time status updates
      setSystemStatuses(prev => prev.map(status => ({
        ...status,
        lastCheck: Date.now(),
        metrics: status.metrics ? {
          ...status.metrics,
          cpu: Math.max(0, Math.min(100, status.metrics.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(0, Math.min(100, status.metrics.memory + (Math.random() - 0.5) * 5)),
          requests: status.metrics.requests + Math.floor(Math.random() * 10)
        } : undefined
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const restartService = (serviceName: string) => {
    toast({
      title: "Service Restart",
      description: `Restarting ${serviceName}...`,
    });
    
    // Simulate service restart
    setSystemStatuses(prev => prev.map(status => 
      status.service === serviceName 
        ? { ...status, status: 'healthy' as const, lastCheck: Date.now() }
        : status
    ));
  };

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Production Monitoring Dashboard</h1>
        <p className="text-muted-foreground">Real-time system status and performance metrics</p>
      </div>

      <AlertSummaryCards alertCounts={alertCounts} />

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Service Status</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemStatuses.map((status, index) => (
              <SystemStatusCard 
                key={index} 
                status={status} 
                onRestart={restartService} 
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Overview</CardTitle>
              <CardDescription>Real-time performance metrics across all services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4" />
                    <span className="text-sm font-medium">Average CPU Usage</span>
                  </div>
                  <div className="text-2xl font-bold">42%</div>
                  <Progress value={42} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span className="text-sm font-medium">Memory Usage</span>
                  </div>
                  <div className="text-2xl font-bold">58%</div>
                  <Progress value={58} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm font-medium">Network Throughput</span>
                  </div>
                  <div className="text-2xl font-bold">1.2 GB/s</div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Firewall</span>
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>SSL Certificates</span>
                    <Badge variant="default" className="bg-green-500">Valid</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Intrusion Detection</span>
                    <Badge variant="default" className="bg-green-500">Monitoring</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Encryption</span>
                    <Badge variant="default" className="bg-green-500">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Threat Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Weapon Detection</span>
                    <Badge variant="default" className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Anomaly Detection</span>
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Behavior Analysis</span>
                    <Badge variant="default" className="bg-yellow-500">Learning</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Real-time Alerts</span>
                    <Badge variant="default" className="bg-green-500">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Active System Alerts</CardTitle>
              <CardDescription>Current alerts requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">High memory usage detected</p>
                    <p className="text-sm text-muted-foreground">Medical sensor service using 85% memory</p>
                    <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                  </div>
                  <Button size="sm" variant="outline">Resolve</Button>
                </div>
                
                <div className="flex items-start space-x-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Scheduled maintenance reminder</p>
                    <p className="text-sm text-muted-foreground">AI model update available for weapon detection</p>
                    <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                  </div>
                  <Button size="sm" variant="outline">Schedule</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionMonitoringDashboard;
