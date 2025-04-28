
import React, { useState } from 'react';
import FamilyMonitoring from '@/components/family/FamilyMonitoring';
import FamilyDataSharingSettings from '@/components/family/FamilyDataSharingSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Share2 } from 'lucide-react';

const FamilyPage = () => {
  const [activeTab, setActiveTab] = useState('monitoring');
  
  return (
    <div className="container pb-10">
      <Tabs defaultValue="monitoring" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="monitoring" className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center">
            <Share2 className="mr-2 h-4 w-4" />
            Data Sharing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="monitoring">
          <FamilyMonitoring />
        </TabsContent>
        
        <TabsContent value="sharing">
          <div className="space-y-2 mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Family Data Sharing</h1>
            <p className="text-muted-foreground">
              Manage how your family members share location, safety, and health information.
            </p>
          </div>
          <FamilyDataSharingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyPage;
