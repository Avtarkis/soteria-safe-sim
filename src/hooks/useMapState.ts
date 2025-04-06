
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ThreatMarker } from '@/types/threats';

export const useMapState = () => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatMarker | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [filters, setFilters] = useState([
    { id: 'physical', label: 'Physical', active: true, color: 'text-red-500' },
    { id: 'cyber', label: 'Cyber', active: true, color: 'text-blue-500' },
    { id: 'environmental', label: 'Environmental', active: true, color: 'text-green-500' },
  ]);
  const mapRef = useRef<L.Map | null>(null);
  
  // Track user location for more accurate alerts
  const userLocationRef = useRef<[number, number] | null>(null);

  const toggleUserLocation = useCallback(() => {
    setShowUserLocation(prev => !prev);
    
    // When enabling location, ensure the map knows high precision mode is active
    if (!showUserLocation) {
      console.log("Dispatching high precision mode activation");
      document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
    }
  }, [showUserLocation]);

  const toggleFilter = useCallback((id: string) => {
    setFilters(prev => 
      prev.map(filter => 
        filter.id === id ? { ...filter, active: !filter.active } : filter
      )
    );
  }, []);

  const handleThreatClick = useCallback((threat: ThreatMarker) => {
    setSelectedThreat(threat);
  }, []);

  const clearSelectedThreat = useCallback(() => {
    setSelectedThreat(null);
  }, []);

  const getFilteredMarkers = useCallback((markers: ThreatMarker[]) => {
    const activeFilters = filters
      .filter(filter => filter.active)
      .map(filter => filter.id);

    return markers.filter(marker => {
      if (!marker.type) return true; // Include if no type specified
      return activeFilters.includes(marker.type);
    });
  }, [filters]);

  // Improved nearby alerts function for better location relevance
  const getNearbyAlerts = useCallback((markers: ThreatMarker[]) => {
    if (!markers.length) return [];

    // Filter markers by proximity to user location when available
    let relevantMarkers = [...markers];
    if (userLocationRef.current) {
      // Sort by distance to user
      relevantMarkers.sort((a, b) => {
        const distA = calculateDistance(
          userLocationRef.current![0], userLocationRef.current![1],
          a.position[0], a.position[1]
        );
        const distB = calculateDistance(
          userLocationRef.current![0], userLocationRef.current![1],
          b.position[0], b.position[1]
        );
        return distA - distB;
      });
      
      // Filter to nearby markers (closest 10)
      relevantMarkers = relevantMarkers.slice(0, 10);
    }
    
    // Calculate the number of alerts to show (1-2 only)
    const maxAlerts = Math.min(2, Math.ceil(relevantMarkers.length / 5));
    
    // Filter to mostly low and occasionally medium risk alerts, very rarely high
    let nearbyMarkers = relevantMarkers
      .filter(marker => {
        // Downgrade high-risk alerts significantly
        if (marker.level === 'high') {
          return Math.random() < 0.02; // Only 2% of high risk alerts pass through
        }
        // Reduce medium alerts
        if (marker.level === 'medium') {
          return Math.random() < 0.2; // 20% of medium risk alerts pass
        }
        return Math.random() < 0.6; // 60% of low risk alerts pass
      })
      .sort((a, b) => {
        // Sort by priority but heavily favor low risk over others
        const typeOrder = { physical: 0, environmental: 1, cyber: 2 };
        const aType = a.type || 'physical';
        const bType = b.type || 'physical';
        
        // Sort by level first (prioritize lower risk)
        const levelOrder = { low: 0, medium: 1, high: 2 };
        if (levelOrder[a.level as keyof typeof levelOrder] !== levelOrder[b.level as keyof typeof levelOrder]) {
          return levelOrder[a.level as keyof typeof levelOrder] - levelOrder[b.level as keyof typeof levelOrder];
        }
        
        // Then by type if same level
        return typeOrder[aType as keyof typeof typeOrder] - typeOrder[bType as keyof typeof typeOrder];
      })
      .slice(0, maxAlerts);
      
    // Downgrade any remaining alerts to make them less alarming
    if (nearbyMarkers.length > 0) {
      nearbyMarkers = nearbyMarkers.map(marker => {
        // 95% chance to downgrade high to medium or low
        if (marker.level === 'high') {
          if (Math.random() < 0.95) {
            return { 
              ...marker, 
              level: Math.random() < 0.8 ? 'low' as 'low' : 'medium' as 'medium'
            };
          }
        }
        // 80% chance to downgrade medium to low
        if (marker.level === 'medium' && Math.random() < 0.8) {
          return { ...marker, level: 'low' as 'low' };
        }
        return marker;
      });
    }
    
    return nearbyMarkers;
  }, []);
  
  // Simple distance calculation helper
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180; 
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in meters
  };
  
  // Listen for location updates to improve alert accuracy
  useEffect(() => {
    const handleLocationUpdate = (e: CustomEvent) => {
      try {
        const { lat, lng } = e.detail;
        userLocationRef.current = [lat, lng];
      } catch (error) {
        console.error("Error handling location update in map state:", error);
      }
    };
    
    document.addEventListener('userLocationUpdated', handleLocationUpdate as EventListener);
    
    return () => {
      document.removeEventListener('userLocationUpdated', handleLocationUpdate as EventListener);
    };
  }, []);

  return {
    selectedThreat,
    showLegend,
    showUserLocation,
    filters,
    mapRef,
    toggleUserLocation,
    toggleFilter,
    handleThreatClick,
    clearSelectedThreat,
    getFilteredMarkers,
    getNearbyAlerts,
    setShowLegend
  };
};

export default useMapState;
