
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';

interface RegionalSettingsProps {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  units: string;
  setUnits: React.Dispatch<React.SetStateAction<string>>;
}

const RegionalSettings = ({ language, setLanguage, units, setUnits }: RegionalSettingsProps) => {
  return (
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
  );
};

export default RegionalSettings;
