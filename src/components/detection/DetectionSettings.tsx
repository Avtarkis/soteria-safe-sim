
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetectionMode } from '@/types/detection';

interface DetectionSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detectionMode: DetectionMode;
  sensitivityLevel: number;
  onDetectionModeChange: (mode: DetectionMode) => void;
  onSensitivityChange: (level: number) => void;
}

const DetectionSettings = ({
  open,
  onOpenChange,
  detectionMode,
  sensitivityLevel,
  onDetectionModeChange,
  onSensitivityChange
}: DetectionSettingsProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detection Settings</DialogTitle>
          <DialogDescription>
            Configure the weapons detection system to match your needs and environment.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="detection-mode">Detection Mode</Label>
              <RadioGroup 
                value={detectionMode} 
                onValueChange={(value) => onDetectionModeChange(value as DetectionMode)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="passive" id="passive" />
                  <Label htmlFor="passive" className="cursor-pointer flex-1">
                    <div className="font-medium">Passive</div>
                    <div className="text-sm text-muted-foreground">
                      Low power usage, background monitoring with basic sensors only
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced" className="cursor-pointer flex-1">
                    <div className="font-medium">Balanced</div>
                    <div className="text-sm text-muted-foreground">
                      Moderate power usage, more active monitoring with advanced analysis
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="aggressive" id="aggressive" />
                  <Label htmlFor="aggressive" className="cursor-pointer flex-1">
                    <div className="font-medium">Aggressive</div>
                    <div className="text-sm text-muted-foreground">
                      High power usage, maximum sensitivity with all sensors active
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <Label htmlFor="sensitivity">Detection Sensitivity</Label>
                <span className="text-sm text-muted-foreground">
                  {sensitivityLevel === 1 ? 'Low' : 
                   sensitivityLevel === 2 ? 'Medium' : 'High'}
                </span>
              </div>
              <Slider
                id="sensitivity"
                min={1}
                max={3}
                step={1}
                value={[sensitivityLevel]}
                onValueChange={(value) => onSensitivityChange(value[0])}
                className="py-4"
              />
            </div>
          </TabsContent>

          <TabsContent value="sensors" className="space-y-4 pt-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Motion Detection</h3>
              <p className="text-xs text-muted-foreground">
                Uses accelerometer and gyroscope to detect suspicious movements
              </p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Audio Analysis</h3>
              <p className="text-xs text-muted-foreground">
                Listens for sounds like gunshots or verbal threats
              </p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">RF Signal Detection</h3>
              <p className="text-xs text-muted-foreground">
                Scans for suspicious wireless transmissions
              </p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">AI Processing</h3>
              <p className="text-xs text-muted-foreground">
                On-device machine learning for threat detection
              </p>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 pt-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Data Collection</h3>
              <p className="text-xs text-muted-foreground">
                All sensor data is processed locally on your device
              </p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Audio Privacy</h3>
              <p className="text-xs text-muted-foreground">
                Audio is never stored or sent to servers unless a threat is confirmed
              </p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Alert Sharing</h3>
              <p className="text-xs text-muted-foreground">
                Alert data is anonymized before being shared with nearby users
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DetectionSettings;
