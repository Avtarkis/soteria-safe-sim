
import { useState, useCallback, useRef, useEffect } from 'react';
import { ThreatMarker } from '@/types/threats';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeThreatData } from './threats/useRealTimeThreatData';
import { generateLocalThreats, generateFallbackThreats } from './threats/localThreatGenerator';
import { useNearbyData } from './threats/useNearbyData';

export const useThreatMarkers = (userLocation: [number, number] | null) => {
  const [loading, setLoading] = useState(true);
  const [threatMarkers, setThreatMarkers] = useState<ThreatMarker[]>([]);
  const { toast } = useToast();
  
  // Use refs to track data state
  const dataLoadedRef = useRef(false);
  const userLocationRef = useRef<[number, number] | null>(null);
  const loadErrorCountRef = useRef(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use custom hooks for data fetching
  const { fetchRealTimeThreats } = useRealTimeThreatData();
  const { fetchNearbyData } = useNearbyData();

  // Calculate distance between two coordinates in meters
  const calculateDistanceInMeters = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in meters
  }, []);

  // Load threat markers with timeout handling
  const loadThreatMarkers = useCallback(async (forceRefresh = false) => {
    // Set a timeout to prevent infinite loading
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    loadingTimeoutRef.current = setTimeout(() => {
      if (loading) {
        console.warn("Threat data loading timeout - using fallback data");
        setLoading(false);
        
        // Set fallback data if we have user location, otherwise empty array
        if (userLocation) {
          const fallbackThreats = generateFallbackThreats(userLocation);
          setThreatMarkers(fallbackThreats);
          dataLoadedRef.current = true;
        } else {
          setThreatMarkers([]);
        }
        
        // Show a toast about the timeout
        toast({
          title: "Data Loading Timeout",
          description: "Using local data instead. Please try refreshing.",
          variant: "destructive"
        });
      }
    }, 10000); // 10 second timeout
    
    // Skip loading if data already loaded and location hasn't changed and not forced
    if (
      dataLoadedRef.current && 
      !forceRefresh && 
      JSON.stringify(userLocationRef.current) === JSON.stringify(userLocation)
    ) {
      setLoading(false);
      return;
    }
    
    // Update location ref
    userLocationRef.current = userLocation;
    
    setLoading(true);
    try {
      let allThreats: ThreatMarker[] = [];
      
      // Get real earthquake and other threat data
      const basicThreats = await fetchRealTimeThreats(userLocation);
      allThreats = [...allThreats, ...basicThreats];
      
      if (userLocation) {
        try {
          // Get data specific to the user's area
          const nearbyThreats = await fetchNearbyData(userLocation);
          allThreats = [...allThreats, ...nearbyThreats];
          
          // Generate local, relevant threats based on the user's location
          const localThreats = generateLocalThreats(userLocation);
          
          // Only add these if we don't have enough threats very close to the user
          const closeThreats = allThreats.filter(threat => {
            if (!userLocation) return false;
            const distance = calculateDistanceInMeters(
              userLocation[0], userLocation[1],
              threat.position[0], threat.position[1]
            );
            return distance < 300; // Within 300 meters
          });
          
          if (closeThreats.length < 2) {
            allThreats = [...allThreats, ...localThreats];
          }
        } catch (error) {
          console.error('Error loading location-specific threats:', error);
          
          // Generate some reasonable local threats as fallback
          const localThreats = generateLocalThreats(userLocation);
          allThreats = [...allThreats, ...localThreats];
        }
      }
      
      // Reset error count on success
      loadErrorCountRef.current = 0;
      setThreatMarkers(allThreats);
      dataLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading threat data:', error);
      loadErrorCountRef.current++;
      
      if (loadErrorCountRef.current < 3) {
        toast({
          title: 'Minor Issue',
          description: 'Some data couldn\'t be loaded. Using local data instead.',
          variant: 'default',
        });
        
        // Add fallback threats if all APIs fail
        if (userLocation) {
          const fallbackThreats = generateLocalThreats(userLocation);
          setThreatMarkers(fallbackThreats);
          dataLoadedRef.current = true;
        } else {
          setThreatMarkers([]);
        }
      }
    } finally {
      setLoading(false);
      
      // Clear the timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  }, [userLocation, toast, fetchRealTimeThreats, fetchNearbyData, loading, calculateDistanceInMeters]);

  // Run initial load and clean up timeouts
  useEffect(() => {
    loadThreatMarkers();
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loadThreatMarkers]);

  return {
    loading,
    threatMarkers,
    loadThreatMarkers
  };
};

export default useThreatMarkers;
