
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightCircle, Heart, Thermometer, Wind, Shield, Activity } from 'lucide-react';
import useAIMonitoring from '@/hooks/use-ai-monitoring';

const AIMonitoringStatus: React.FC = () => {
  const { settings, isMonitoring, updateSettings, toggleMonitoring } = useAIMonitoring();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span>AI Health & Safety Monitoring</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Switch 
            id="ai-monitoring" 
            checked={isMonitoring} 
            onCheckedChange={toggleMonitoring} 
          />
          <Label htmlFor="ai-monitoring" className="text-sm">
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monitoring">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <Label htmlFor="health-monitoring" className="text-sm">Health Monitoring</Label>
                </div>
                <Switch 
                  id="health-monitoring" 
                  checked={settings.healthMonitoring} 
                  onCheckedChange={(checked) => updateSettings({ healthMonitoring: checked })} 
                  disabled={!isMonitoring}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-amber-500" />
                  <Label htmlFor="env-monitoring" className="text-sm">Environmental Monitoring</Label>
                </div>
                <Switch 
                  id="env-monitoring" 
                  checked={settings.environmentalMonitoring} 
                  onCheckedChange={(checked) => updateSettings({ environmentalMonitoring: checked })} 
                  disabled={!isMonitoring}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="security-monitoring" className="text-sm">Security Monitoring</Label>
                </div>
                <Switch 
                  id="security-monitoring" 
                  checked={settings.securityMonitoring} 
                  onCheckedChange={(checked) => updateSettings({ securityMonitoring: checked })} 
                  disabled={!isMonitoring}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="response">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Automatic Response Level</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    className={`p-2 rounded-md text-sm border ${settings.autoResponseLevel === 'none' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input'}`}
                    onClick={() => updateSettings({ autoResponseLevel: 'none' })}
                    disabled={!isMonitoring}
                  >
                    None
                  </button>
                  <button 
                    className={`p-2 rounded-md text-sm border ${settings.autoResponseLevel === 'notify' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input'}`}
                    onClick={() => updateSettings({ autoResponseLevel: 'notify' })}
                    disabled={!isMonitoring}
                  >
                    Notify Only
                  </button>
                  <button 
                    className={`p-2 rounded-md text-sm border ${settings.autoResponseLevel === 'assist' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input'}`}
                    onClick={() => updateSettings({ autoResponseLevel: 'assist' })}
                    disabled={!isMonitoring}
                  >
                    Assisted Response
                  </button>
                  <button 
                    className={`p-2 rounded-md text-sm border ${settings.autoResponseLevel === 'full' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input'}`}
                    onClick={() => updateSettings({ autoResponseLevel: 'full' })}
                    disabled={!isMonitoring}
                  >
                    Full Automation
                  </button>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <ul className="space-y-1">
                  <li><strong>None:</strong> Only displays alerts without taking action</li>
                  <li><strong>Notify:</strong> Alerts emergency contacts for critical events</li>
                  <li><strong>Assisted:</strong> Prepares emergency calls but waits for confirmation</li>
                  <li><strong>Full:</strong> Automatically calls for help in critical situations</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIMonitoringStatus;
