
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface ReportThreatButtonProps {
  destination: {
    name: string;
    coordinates: [number, number];
  };
}

const ReportThreatButton = ({ destination }: ReportThreatButtonProps) => {
  const handleReportThreat = () => {
    document.dispatchEvent(new CustomEvent('openReportThreatDialog', {
      detail: { location: destination.coordinates }
    }));
  };
  
  return (
    <Button variant="outline" size="sm" onClick={handleReportThreat}>
      <Shield className="mr-1 h-4 w-4" />
      Report Threat
    </Button>
  );
};

export default ReportThreatButton;
