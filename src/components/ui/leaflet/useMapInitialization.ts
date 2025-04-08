
import { useEffect, useRef } from 'react';
import L from 'leaflet';

/**
 * Hook to initialize the Leaflet map
 */
export const useMapInitialization = (
  mapContainerRef: React.RefObject<HTMLDivElement>,
  center: [number, number],
  zoom: number
) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const mapCreated = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapCreated.current) return;

    try {
      console.log('Initializing map with center:', center, 'zoom:', zoom);
      
      // Create map with faster rendering options
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true, // Use canvas renderer for better performance
        renderer: L.canvas({ padding: 0.5 }), // More efficient rendering
        fadeAnimation: false, // Disable animations for faster loading
        markerZoomAnimation: true,
        inertia: false, // Disable inertia for faster response
      });

      // Add attribution in a more compact form
      L.control.attribution({
        prefix: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        position: 'bottomright'
      }).addTo(map);
      
      // Add zoom control to bottom right
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Create a markers layer group
      const markersLayer = L.layerGroup().addTo(map);

      // Use OpenStreetMap tiles which don't require authentication
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        // Add performance optimizations
        updateWhenZooming: false,
        updateWhenIdle: true,
      }).addTo(map);

      // Store refs
      mapRef.current = map;
      markersLayerRef.current = markersLayer;
      mapCreated.current = true;
      
      // Force a resize after creation
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize(true);
        }
      }, 100);
      
      // Listen for center event
      document.addEventListener('centerMapOnUserLocation', ((e: CustomEvent) => {
        if (mapRef.current && e.detail) {
          const { lat, lng } = e.detail;
          mapRef.current.setView([lat, lng], 16, { animate: true });
        }
      }) as EventListener);

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        
        document.removeEventListener('centerMapOnUserLocation', ((e: CustomEvent) => {}) as EventListener);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapContainerRef, center, zoom]);

  return { mapRef, markersLayerRef, mapCreated: mapCreated.current };
};

export default useMapInitialization;
