
import { useState, useRef, useCallback } from 'react';
import { ThreatMarker } from '@/types/threats';

interface ThreatZone {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  level: 'low' | 'medium' | 'high';
  title: string;
  details: string;
  type?: 'cyber' | 'physical' | 'environmental';
}

interface FilterOption {
  id: string;
  label: string;
  active: boolean;
  color: string;
}

export const useMapState = () => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatZone | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [filters, setFilters] = useState<FilterOption[]>([
    { id: 'cyber', label: 'Cyber', active: true, color: 'bg-blue-500' },
    { id: 'physical', label: 'Physical', active: true, color: 'bg-red-500' },
    { id: 'environmental', label: 'Environmental', active: true, color: 'bg-green-500' },
  ]);
  const mapRef = useRef<L.Map | null>(null);

  const toggleUserLocation = useCallback(() => {
    setShowUserLocation(prev => !prev);
  }, []);

  const toggleFilter = useCallback((id: string) => {
    setFilters(filters => filters.map(filter => 
      filter.id === id ? { ...filter, active: !filter.active } : filter
    ));
  }, []);

  const handleThreatClick = useCallback((threat: ThreatMarker) => {
    setSelectedThreat({
      id: threat.id,
      lat: threat.position[0],
      lng: threat.position[1],
      radius: threat.level === 'high' ? 20 : threat.level === 'medium' ? 15 : 10,
      level: threat.level,
      title: threat.title,
      details: threat.details,
      type: threat.type
    });
  }, []);

  const clearSelectedThreat = useCallback(() => {
    setSelectedThreat(null);
  }, []);

  const getFilteredMarkers = useCallback((threatMarkers: ThreatMarker[]) => {
    if (filters.every(f => f.active)) return threatMarkers;
    
    return threatMarkers.filter(marker => {
      if (!marker.type) return true;
      return filters.find(f => f.id === marker.type)?.active;
    });
  }, [filters]);

  const getNearbyAlerts = useCallback((threatMarkers: ThreatMarker[]) => {
    return threatMarkers
      .sort((a, b) => {
        if (a.level === 'high' && b.level !== 'high') return -1;
        if (a.level !== 'high' && b.level === 'high') return 1;
        if (a.level === 'medium' && b.level === 'low') return -1;
        if (a.level === 'low' && b.level === 'medium') return 1;
        return 0;
      })
      .slice(0, 3);
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
    setShowLegend,
  };
};

export default useMapState;
