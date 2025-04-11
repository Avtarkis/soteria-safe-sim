
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

const AdvancedSettings = () => {
  return (
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
  );
};

export default AdvancedSettings;
