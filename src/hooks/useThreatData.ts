
import { useState, useEffect, useCallback } from 'react';
import { ThreatMarker } from '@/types/threats';
import { threatService } from '@/services/threatService';
import { crimeService } from '@/services/crimeService';
import { hibpService } from '@/services/hibpService';
import { emergencyService } from '@/services/emergencyService';
import { useToast } from '@/hooks/use-toast';

export const useThreatData = (userLocation: [number, number] | null) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [threatMarkers, setThreatMarkers] = useState<ThreatMarker[]>([]);
  const [disasterAlerts, setDisasterAlerts] = useState<any[]>([]);
  const [emergencyNumbers, setEmergencyNumbers] = useState<any>(null);
  const { toast } = useToast();

  const loadThreatData = useCallback(async () => {
    if (refreshing) return; // Prevent multiple simultaneous data loads
    
    setLoading(true);
    try {
      let allThreats: ThreatMarker[] = [];
      
      const basicThreats = await threatService.getGlobalThreatMarkers(userLocation || undefined);
      allThreats = [...allThreats, ...basicThreats];
      
      if (userLocation) {
        try {
          const state = 'CA';
          const county = 'Los Angeles';
          
          const crimeThreats = await crimeService.getCrimeThreats(state, county);
          
          const crimeThreatsNearUser = crimeThreats.map(threat => ({
            ...threat,
            position: [
              userLocation[0] + (Math.random() * 0.02 - 0.01), 
              userLocation[1] + (Math.random() * 0.02 - 0.01)
            ] as [number, number]
          }));
          
          allThreats = [...allThreats, ...crimeThreatsNearUser];
          
          if (disasterAlerts.length > 0) {
            const disasterMarkers: ThreatMarker[] = disasterAlerts.map((alert, index) => ({
              id: `disaster-${alert.id || index}`,
              position: [
                userLocation[0] + (Math.random() * 0.05 - 0.025), 
                userLocation[1] + (Math.random() * 0.05 - 0.025)
              ] as [number, number],
              level: alert.severity === 'alert' ? 'high' : 
                    alert.severity === 'warning' ? 'medium' : 'low',
              title: alert.title,
              details: alert.description || `${alert.type} alert in ${alert.country}`,
              type: 'environmental'
            }));
            
            allThreats = [...allThreats, ...disasterMarkers];
          }
        } catch (error) {
          console.error('Error loading crime/disaster data:', error);
        }
      }
      
      try {
        const cyberThreats = await hibpService.getBreachThreats('demo@example.com');
        
        if (userLocation) {
          const cyberThreatsNearUser = cyberThreats.map(threat => ({
            ...threat,
            position: [
              userLocation[0] + (Math.random() * 0.05 - 0.025), 
              userLocation[1] + (Math.random() * 0.05 - 0.025)
            ] as [number, number]
          }));
          allThreats = [...allThreats, ...cyberThreatsNearUser];
        } else {
          allThreats = [...allThreats, ...cyberThreats];
        }
      } catch (error) {
        console.error('Error loading cyber threat data:', error);
      }
      
      setThreatMarkers(allThreats);
    } catch (error) {
      console.error('Error loading threat data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load some threat data. Please try again later.',
        variant: 'destructive',
      });
      
      if (userLocation) {
        setThreatMarkers([
          {
            id: '1',
            position: [userLocation[0] + 0.1, userLocation[1] - 0.1],
            level: 'high',
            title: 'Data Breach Alert',
            details: 'Major data breach reported in this area affecting financial institutions.',
            type: 'cyber'
          },
          {
            id: '2',
            position: [userLocation[0] - 0.05, userLocation[1] + 0.05],
            level: 'medium',
            title: 'Street Crime Warning',
            details: 'Recent increase in street theft and muggings reported in this neighborhood.',
            type: 'physical'
          },
          {
            id: '3',
            position: [userLocation[0], userLocation[1] + 0.2],
            level: 'low',
            title: 'Weather Advisory',
            details: 'Potential flooding in low-lying areas due to heavy rainfall forecast.',
            type: 'environmental'
          }
        ]);
      } else {
        setThreatMarkers([
          {
            id: '1',
            position: [40.7128, -74.006],
            level: 'high',
            title: 'Data Breach Alert',
            details: 'Major data breach reported in this area affecting financial institutions.',
            type: 'cyber'
          },
          {
            id: '2',
            position: [34.0522, -118.2437],
            level: 'medium',
            title: 'Street Crime Warning',
            details: 'Recent increase in street theft and muggings reported in this neighborhood.',
            type: 'physical'
          },
          {
            id: '3',
            position: [51.5074, -0.1278],
            level: 'low',
            title: 'Weather Advisory',
            details: 'Potential flooding in low-lying areas due to heavy rainfall forecast.',
            type: 'environmental'
          }
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userLocation, disasterAlerts, toast, refreshing]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadThreatData();
  }, [loadThreatData]);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      if (!mounted) return;
      
      if (userLocation) {
        await loadThreatData();
        
        // Load emergency services information
        try {
          const numbers = await emergencyService.getEmergencyNumbersByLocation(userLocation[0], userLocation[1]);
          if (numbers && mounted) {
            setEmergencyNumbers(numbers);
            toast({
              title: "Emergency Services",
              description: `Loaded emergency numbers for ${numbers.country}`,
            });
          }
        } catch (err) {
          console.error("Failed to load emergency numbers:", err);
        }
        
        try {
          const alerts = await emergencyService.getDisasterAlertsNearLocation(userLocation[0], userLocation[1]);
          if (mounted) {
            setDisasterAlerts(alerts);
          }
        } catch (err) {
          console.error("Failed to load disaster alerts:", err);
        }
      } else {
        await loadThreatData();
      }
    };
    
    fetchData();
    
    return () => {
      mounted = false;
    };
  }, [userLocation, toast, loadThreatData]);

  return {
    loading,
    refreshing,
    threatMarkers,
    disasterAlerts,
    emergencyNumbers,
    handleRefresh
  };
};

export default useThreatData;
