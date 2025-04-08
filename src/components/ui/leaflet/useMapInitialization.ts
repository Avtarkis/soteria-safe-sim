
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
  const initAttempted = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapCreated.current || initAttempted.current) return;
    
    // Mark that we've attempted initialization to prevent multiple attempts
    initAttempted.current = true;

    try {
      console.log('Initializing map with center:', center, 'zoom:', zoom);
      
      // Important: Wait for the DOM to be fully ready
      const timer = setTimeout(() => {
        // Try clearing any existing map instance first
        if (mapRef.current) {
          try {
            mapRef.current.remove();
          } catch (e) {
            console.error("Error removing existing map:", e);
          }
          mapRef.current = null;
        }
        
        // Make sure the container element is accessible
        if (!mapContainerRef.current) {
          console.error('Map container element not found');
          return;
        }
        
        // Ensure the container has dimensions
        mapContainerRef.current.style.height = mapContainerRef.current.style.height || '400px';
        
        // Create map with faster rendering options and limit update frequency
        const map = L.map(mapContainerRef.current, {
          center,
          zoom,
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true,
          renderer: L.canvas({ padding: 0.5 }),
          fadeAnimation: false,
          markerZoomAnimation: false,
          zoomAnimation: false,
          inertia: false,
          maxBoundsViscosity: 1.0
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
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          // Add performance optimizations
          updateWhenZooming: false,
          updateWhenIdle: true,
          noWrap: true
        });
        
        // Add the tile layer immediately - this helps with visibility
        tileLayer.addTo(map);
        
        // Forcefully set the view
        map.setView(center, zoom);
        map.invalidateSize(true);
        
        // Store refs
        mapRef.current = map;
        markersLayerRef.current = markersLayer;
        mapCreated.current = true;
        
        // Force only ONE resize after creation
        setTimeout(() => {
          if (mapRef.current) {
            window.dispatchEvent(new Event('resize'));
            mapRef.current.invalidateSize(true);
          }
        }, 500);
        
        // Disable frequent refresh
        map.off('moveend');
        
        // Disable automatic zooming to prevent erratic behavior
        map.options.trackResize = false;
        
        // Limit the frequency of location updates
        let lastLocationUpdate = 0;
        document.addEventListener('userLocationUpdated', ((e: CustomEvent) => {
          const now = Date.now();
          // Only process location updates every 3 seconds
          if (now - lastLocationUpdate > 3000) {
            lastLocationUpdate = now;
            if (mapRef.current && e.detail) {
              console.log("Processing location update");
            }
          }
        }) as EventListener);
        
        // Handle center event with rate limiting
        let lastCenterEvent = 0;
        document.addEventListener('centerMapOnUserLocation', ((e: CustomEvent) => {
          const now = Date.now();
          if (now - lastCenterEvent > 2000) {
            lastCenterEvent = now;
            if (mapRef.current && e.detail) {
              const { lat, lng } = e.detail;
              mapRef.current.setView([lat, lng], 16, { animate: false });
            }
          }
        }) as EventListener);
      }, 300);

      return () => {
        clearTimeout(timer);
        if (mapRef.current) {
          try {
            mapRef.current.remove();
          } catch (e) {
            console.error("Error removing map on cleanup:", e);
          }
          mapRef.current = null;
          mapCreated.current = false;
          initAttempted.current = false;
        }
        
        document.removeEventListener('centerMapOnUserLocation', ((e: CustomEvent) => {}) as EventListener);
        document.removeEventListener('userLocationUpdated', ((e: CustomEvent) => {}) as EventListener);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      initAttempted.current = false;
    }
  }, [mapContainerRef, center, zoom]);

  return { mapRef, markersLayerRef, mapCreated: mapCreated.current };
};

export default useMapInitialization;
