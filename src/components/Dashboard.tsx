
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import useAIMonitoring from '@/hooks/use-ai-monitoring';
import { 
  DashboardHeader, 
  SecurityMetricsSection,
  AlertsAndFamilySection,
  QuickActionsSection 
} from './dashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { detections } = useAIMonitoring();

  // Calculate route to safe destination
  const handleRouteClick = (destination: string) => {
    toast({
      title: `Safe Route to ${destination}`,
      description: `Calculating the safest route to your ${destination.toLowerCase()} location...`,
    });
    
    // Simulate route calculation
    setTimeout(() => {
      toast({
        title: `Route Found`,
        description: `The safest route to your ${destination.toLowerCase()} has been calculated. Redirecting to map view...`,
      });
      
      // Navigate to map with predefined destination
      navigate(`/map?destination=${destination.toLowerCase()}`);
    }, 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-fade-in">
      <DashboardHeader />
      <SecurityMetricsSection />
      <AlertsAndFamilySection detections={detections} />
      <QuickActionsSection handleRouteClick={handleRouteClick} />
    </div>
  );
};

export default Dashboard;
