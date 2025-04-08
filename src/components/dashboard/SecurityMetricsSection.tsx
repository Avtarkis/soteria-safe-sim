
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CreditCard } from 'lucide-react';

const SecurityMetricsSection = () => {
  return (
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
  );
};

export default SecurityMetricsSection;
