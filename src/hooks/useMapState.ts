
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
    const maxAlerts = Math.min(2, Math.ceil(markers.length / 8));
    
    // Filter to mostly medium and low risk alerts, rarely high
    let nearbyMarkers = [...markers]
      .filter(marker => {
        // Reduce high-risk alerts significantly
        if (marker.level === 'high') {
          return Math.random() < 0.15; // Only 15% of high risk alerts pass through
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by priority but favor medium over high risk
        const typeOrder = { physical: 0, environmental: 1, cyber: 2 };
        const aType = a.type || 'physical';
        const bType = b.type || 'physical';
        
        // Sort by type first
        if (typeOrder[aType as keyof typeof typeOrder] !== typeOrder[bType as keyof typeof typeOrder]) {
          return typeOrder[aType as keyof typeof typeOrder] - typeOrder[bType as keyof typeof typeOrder];
        }
        
        // Then by level but prioritize medium over high (less alarming)
        const levelOrder = { medium: 0, low: 1, high: 2 };
        return levelOrder[a.level as keyof typeof levelOrder] - levelOrder[b.level as keyof typeof levelOrder];
      })
      .slice(0, maxAlerts);
      
    // If we have too many alerts or happen to get multiple high-risk ones,
    // downgrade them further to make them less alarming
    if (nearbyMarkers.length > 0) {
      nearbyMarkers = nearbyMarkers.map((marker, index) => {
        // First alert has a small chance to be medium/high, others should be lower risk
        if (index === 0) {
          // 70% chance to downgrade high to medium
          if (marker.level === 'high' && Math.random() < 0.7) {
            return { ...marker, level: 'medium' as 'medium' };
          }
        } else {
          // Subsequent alerts should be medium or low
          if (marker.level === 'high') {
            return { ...marker, level: 'medium' as 'medium' };
          }
          // 50% chance to downgrade medium to low for non-first alerts
          if (marker.level === 'medium' && Math.random() < 0.5) {
            return { ...marker, level: 'low' as 'low' };
          }
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
