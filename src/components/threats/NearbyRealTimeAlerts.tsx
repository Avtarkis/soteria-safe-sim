
import React, { useMemo } from 'react';
import { ThreatMarker } from '@/types/threats';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NearbyRealTimeAlertsProps {
  threats: ThreatMarker[];
  userLocation: [number, number] | null;
  maxDistance?: number; // in meters
}

const NearbyRealTimeAlerts: React.FC<NearbyRealTimeAlertsProps> = ({ 
  threats, 
  userLocation,
  maxDistance = 1000 // Default 1km radius
}) => {
  const nearbyThreats = useMemo(() => {
    if (!userLocation || !threats.length) return [];
    
    return threats
      .filter(threat => {
        // Calculate distance in meters using the Haversine formula
        const R = 6371e3; // Earth radius in meters
        const lat1 = userLocation[0] * Math.PI/180;
        const lat2 = threat.position[0] * Math.PI/180;
        const deltaLat = (threat.position[0] - userLocation[0]) * Math.PI/180;
        const deltaLon = (threat.position[1] - userLocation[1]) * Math.PI/180;
        
        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance <= maxDistance;
      })
      .sort((a, b) => {
        // Calculate distances for sorting
        const R = 6371e3;
        
        // Distance for threat A
        const lat1A = userLocation[0] * Math.PI/180;
        const lat2A = a.position[0] * Math.PI/180;
        const deltaLatA = (a.position[0] - userLocation[0]) * Math.PI/180;
        const deltaLonA = (a.position[1] - userLocation[1]) * Math.PI/180;
        const aA = Math.sin(deltaLatA/2) * Math.sin(deltaLatA/2) +
                  Math.cos(lat1A) * Math.cos(lat2A) *
                  Math.sin(deltaLonA/2) * Math.sin(deltaLonA/2);
        const cA = 2 * Math.atan2(Math.sqrt(aA), Math.sqrt(1-aA));
        const distanceA = R * cA;
        
        // Distance for threat B
        const lat1B = userLocation[0] * Math.PI/180;
        const lat2B = b.position[0] * Math.PI/180;
        const deltaLatB = (b.position[0] - userLocation[0]) * Math.PI/180;
        const deltaLonB = (b.position[1] - userLocation[1]) * Math.PI/180;
        const aB = Math.sin(deltaLatB/2) * Math.sin(deltaLatB/2) +
                  Math.cos(lat1B) * Math.cos(lat2B) *
                  Math.sin(deltaLonB/2) * Math.sin(deltaLonB/2);
        const cB = 2 * Math.atan2(Math.sqrt(aB), Math.sqrt(1-aB));
        const distanceB = R * cB;
        
        // First sort by distance
        return distanceA - distanceB;
      })
      .slice(0, 5); // Only take the 5 closest threats
  }, [threats, userLocation, maxDistance]);
  
  if (!nearbyThreats.length) {
    return (
      <div className="text-center text-muted-foreground p-4">
        <Info className="h-5 w-5 mx-auto mb-2" />
        <p>No nearby alerts detected in your immediate vicinity.</p>
      </div>
    );
  }
  
  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return <AlertCircle className="text-red-500 h-5 w-5 mr-2" />;
      case 'medium':
        return <AlertTriangle className="text-amber-500 h-5 w-5 mr-2" />;
      default:
        return <Info className="text-blue-500 h-5 w-5 mr-2" />;
    }
  };
  
  const getRiskLabel = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500">Medium Risk</Badge>;
      default:
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Low Risk</Badge>;
    }
  };
  
  return (
    <div className="space-y-3">
      {nearbyThreats.map((threat) => (
        <div 
          key={threat.id} 
          className="flex items-start p-3 border rounded-lg shadow-sm bg-card"
        >
          <div className="flex-shrink-0">
            {getRiskIcon(threat.level)}
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-sm">{threat.title}</h4>
              {getRiskLabel(threat.level)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{threat.details}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NearbyRealTimeAlerts;
