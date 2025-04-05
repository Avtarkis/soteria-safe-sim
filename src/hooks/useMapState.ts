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

    // Calculate the number of alerts to show (1-3)
    const maxAlerts = Math.min(3, Math.ceil(markers.length / 5));
    
    // Get markers for nearby alerts with controlled distribution of risk levels
    const nearbyMarkers = [...markers]
      .filter(marker => {
        // Filter based on distance if we have a map reference
        // Otherwise, just use the first few markers
        return true;
      })
      .sort((a, b) => {
        // Sort by priority: physical > environmental > cyber
        const typeOrder = { physical: 0, environmental: 1, cyber: 2 };
        const aType = a.type || 'physical';
        const bType = b.type || 'physical';
        
        // Sort by type first
        if (typeOrder[aType as keyof typeof typeOrder] !== typeOrder[bType as keyof typeof typeOrder]) {
          return typeOrder[aType as keyof typeof typeOrder] - typeOrder[bType as keyof typeof typeOrder];
        }
        
        // Then by level (high > medium > low)
        const levelOrder = { high: 0, medium: 1, low: 2 };
        return levelOrder[a.level] - levelOrder[b.level];
      })
      .slice(0, maxAlerts);
      
    // Make sure we don't have too many high-risk alerts (maximum 1)
    const highRiskCount = nearbyMarkers.filter(m => m.level === 'high').length;
    if (highRiskCount > 1) {
      // Downgrade some high risk alerts to medium
      let downgraded = 0;
      for (let i = 0; i < nearbyMarkers.length && downgraded < highRiskCount - 1; i++) {
        if (nearbyMarkers[i].level === 'high') {
          nearbyMarkers[i] = {
            ...nearbyMarkers[i],
            level: 'medium' as 'medium'
          };
          downgraded++;
        }
      }
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
