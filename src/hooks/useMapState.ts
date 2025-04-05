
import { useState, useRef, useCallback, useEffect } from 'react';
import { ThreatMarker } from '@/types/threats';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  // Store the previous tracking state to detect changes
  const previousTrackingStateRef = useRef(showUserLocation);

  const toggleUserLocation = useCallback(() => {
    setShowUserLocation(prev => !prev);
    previousTrackingStateRef.current = !showUserLocation;
  }, [showUserLocation]);

  // Listen for map centering events
  useEffect(() => {
    const handleCenterMap = (e: CustomEvent) => {
      if (mapRef.current && e.detail) {
        const { lat, lng } = e.detail;
        
        // Use a closer zoom level for better accuracy
        const zoomLevel = 18;
        mapRef.current.setView([lat, lng], zoomLevel, { animate: true });
      }
    };

    document.addEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    
    return () => {
      document.removeEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    };
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
    // Filter threats that are very close to the user location (within 1km)
    const userLocation = mapRef.current?.getCenter();
    
    let closeThreats = threatMarkers;
    
    if (userLocation) {
      closeThreats = threatMarkers.filter(threat => {
        const distance = Math.sqrt(
          Math.pow((threat.position[0] - userLocation.lat) * 111000, 2) + 
          Math.pow((threat.position[1] - userLocation.lng) * 111000 * Math.cos(userLocation.lat * Math.PI/180), 2)
        );
        return distance < 1000; // Within 1km
      });
    }
    
    // Sort by threat level (high to low)
    return closeThreats
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
