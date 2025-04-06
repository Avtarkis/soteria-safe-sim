
import { useState, useRef, useCallback, useMemo } from 'react';
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

  const toggleUserLocation = useCallback(() => {
    setShowUserLocation(prev => !prev);
  }, []);

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

  const getNearbyAlerts = useCallback((markers: ThreatMarker[]) => {
    if (!markers.length) return [];

    // Calculate the number of alerts to show (1-2 only)
    const maxAlerts = Math.min(1, Math.ceil(markers.length / 10));
    
    // Filter to mostly low and occasionally medium risk alerts, very rarely high
    let nearbyMarkers = [...markers]
      .filter(marker => {
        // Reduce high-risk alerts significantly
        if (marker.level === 'high') {
          return Math.random() < 0.05; // Only 5% of high risk alerts pass through
        }
        // Reduce medium alerts
        if (marker.level === 'medium') {
          return Math.random() < 0.3; // 30% of medium risk alerts pass
        }
        return Math.random() < 0.7; // 70% of low risk alerts pass
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
        // 90% chance to downgrade high to medium or low
        if (marker.level === 'high') {
          if (Math.random() < 0.9) {
            return { 
              ...marker, 
              level: Math.random() < 0.7 ? 'low' as 'low' : 'medium' as 'medium'
            };
          }
        }
        // 70% chance to downgrade medium to low
        if (marker.level === 'medium' && Math.random() < 0.7) {
          return { ...marker, level: 'low' as 'low' };
        }
        return marker;
      });
    }
    
    return nearbyMarkers;
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
