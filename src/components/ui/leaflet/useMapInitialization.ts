
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
      
      // Important: Wait for the DOM to be fully ready
      setTimeout(() => {
        // Try clearing any existing map instance first
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        
        // Make sure the container element is accessible
        if (!mapContainerRef.current) {
          console.error('Map container element not found');
          return;
        }
        
        // Ensure the container has dimensions
        mapContainerRef.current.style.height = mapContainerRef.current.style.height || '400px';
        
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
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          // Add performance optimizations
          updateWhenZooming: false,
          updateWhenIdle: true,
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
        
        // Force multiple resizes after creation for reliability
        const resizeTimes = [100, 300, 500, 1000, 2000];
        resizeTimes.forEach(time => {
          setTimeout(() => {
            if (mapRef.current) {
              console.log(`Forcing map resize after ${time}ms`);
              window.dispatchEvent(new Event('resize'));
              mapRef.current.invalidateSize(true);
            }
          }, time);
        });
        
        // Listen for center event
        document.addEventListener('centerMapOnUserLocation', ((e: CustomEvent) => {
          if (mapRef.current && e.detail) {
            const { lat, lng } = e.detail;
            mapRef.current.setView([lat, lng], 16, { animate: true });
          }
        }) as EventListener);
      }, 100); // Short delay to ensure DOM is ready

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          mapCreated.current = false;
        }
        
        document.removeEventListener('centerMapOnUserLocation', ((e: CustomEvent) => {}) as EventListener);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      
      // Try to reinitialize after a short delay if there was an error
      setTimeout(() => {
        if (!mapCreated.current && mapContainerRef.current) {
          console.log('Attempting to reinitialize map after error');
          mapCreated.current = false; // Ensure flag is reset
        }
      }, 2000);
    }
  }, [mapContainerRef, center, zoom]);

  return { mapRef, markersLayerRef, mapCreated: mapCreated.current };
};

export default useMapInitialization;
