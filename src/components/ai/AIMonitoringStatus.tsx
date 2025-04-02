
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Switch } from '@/components/ui/switch';
import { useAIMonitoring } from '@/hooks/use-ai-monitoring';
import { Button } from '@/components/ui/button';
import { HeartPulse, Shield, Zap, Brain, BrainCircuit } from 'lucide-react';

const AIMonitoringStatus = () => {
  const { isMonitoring, settings, toggleMonitoring, updateSettings } = useAIMonitoring();

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">AI Monitoring Status</CardTitle>
        <div className="flex items-center space-x-2">
          <Switch 
            id="ai-monitoring" 
            checked={isMonitoring}
            onCheckedChange={toggleMonitoring}
          />
          <label 
            htmlFor="ai-monitoring" 
            className={`text-sm font-medium ${isMonitoring ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
          >
            {isMonitoring ? 'Active' : 'Inactive'}
          </label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="health-monitoring" 
                checked={settings.healthMonitoring}
                onCheckedChange={(checked) => updateSettings({ healthMonitoring: checked })}
                disabled={!isMonitoring}
              />
              <div className="flex items-center">
                <HeartPulse className="h-4 w-4 mr-2 text-red-500" />
                <label htmlFor="health-monitoring" className="text-sm font-medium">Health</label>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="environmental-monitoring" 
                checked={settings.environmentalMonitoring}
                onCheckedChange={(checked) => updateSettings({ environmentalMonitoring: checked })}
                disabled={!isMonitoring}
              />
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                <label htmlFor="environmental-monitoring" className="text-sm font-medium">Environment</label>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="security-monitoring" 
                checked={settings.securityMonitoring}
                onCheckedChange={(checked) => updateSettings({ securityMonitoring: checked })}
                disabled={!isMonitoring}
              />
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-amber-500" />
                <label htmlFor="security-monitoring" className="text-sm font-medium">Security</label>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="family-monitoring" 
                checked={true}
                disabled={!isMonitoring}
              />
              <div className="flex items-center">
                <Brain className="h-4 w-4 mr-2 text-purple-500" />
                <label htmlFor="family-monitoring" className="text-sm font-medium">Family</label>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Automatic Response Level</h4>
            <div className="grid grid-cols-4 gap-2">
              <Button 
                variant={settings.autoResponseLevel === 'none' ? "default" : "outline"} 
                size="sm"
                onClick={() => updateSettings({ autoResponseLevel: 'none' })}
                disabled={!isMonitoring}
              >
                None
              </Button>
              <Button 
                variant={settings.autoResponseLevel === 'notify' ? "default" : "outline"} 
                size="sm"
                onClick={() => updateSettings({ autoResponseLevel: 'notify' })}
                disabled={!isMonitoring}
              >
                Notify
              </Button>
              <Button 
                variant={settings.autoResponseLevel === 'assist' ? "default" : "outline"} 
                size="sm"
                onClick={() => updateSettings({ autoResponseLevel: 'assist' })}
                disabled={!isMonitoring}
              >
                Assist
              </Button>
              <Button 
                variant={settings.autoResponseLevel === 'full' ? "default" : "outline"} 
                size="sm"
                onClick={() => updateSettings({ autoResponseLevel: 'full' })}
                disabled={!isMonitoring}
              >
                Full Auto
              </Button>
            </div>
          </div>
          
          <div className="bg-secondary/50 rounded-lg p-3 flex items-center">
            <BrainCircuit className="h-5 w-5 mr-3 text-primary" />
            <div className="text-sm flex-1">
              <p>
                {isMonitoring 
                  ? 'AI is actively monitoring for potential threats and will respond according to your settings.'
                  : 'AI monitoring is currently disabled. Enable it to detect and respond to potential threats.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMonitoringStatus;
