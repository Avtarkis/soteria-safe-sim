
import { useRef } from 'react';
import L from 'leaflet';

/**
 * Hook to create and manage location-related refs
 * Centralizes all the refs needed for location tracking
 */
export function useLocationRefs() {
  // Map element refs
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);
  const streetLabelRef = useRef<L.Marker | null>(null);
  
  // Location data refs
  const userLocationLatLngRef = useRef<L.LatLng | null>(null);
  const userLocationAccuracyRef = useRef<number>(0);
  const safetyLevelRef = useRef<'safe' | 'caution' | 'danger'>('safe');
  
  // State tracking refs
  const locationTrackingInitializedRef = useRef<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const lastEventTimeRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);
  const highPrecisionModeRef = useRef<boolean>(false);

  return {
    userLocationMarkerRef,
    userLocationCircleRef,
    streetLabelRef,
    userLocationLatLngRef,
    userLocationAccuracyRef,
    safetyLevelRef,
    locationTrackingInitializedRef,
    watchIdRef,
    lastEventTimeRef,
    errorCountRef,
    highPrecisionModeRef
  };
}
