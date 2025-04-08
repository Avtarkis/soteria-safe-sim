
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
      
      // Try clearing any existing map instance first
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      
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
      
      // Add the tile layer with a small delay to ensure the map is ready
      setTimeout(() => {
        tileLayer.addTo(map);
        
        // Force a redraw by resetting the view
        map.setView(center, zoom);
        
        // Force resize for good measure
        map.invalidateSize(true);
      }, 100);

      // Store refs
      mapRef.current = map;
      markersLayerRef.current = markersLayer;
      mapCreated.current = true;
      
      // Force multiple resizes after creation to ensure proper rendering
      const resizeTimes = [100, 300, 500, 1000, 2000, 5000];
      resizeTimes.forEach(time => {
        setTimeout(() => {
          if (mapRef.current) {
            console.log(`Forcing map resize after ${time}ms`);
            window.dispatchEvent(new Event('resize'));
            mapRef.current.invalidateSize(true);
            
            // For longer delays, also check if tiles need to be reloaded
            if (time > 1000) {
              let tilesLoaded = false;
              
              mapRef.current.eachLayer((layer) => {
                if ((layer as any)._url && (layer as any)._url.includes('openstreetmap')) {
                  tilesLoaded = true;
                }
              });
              
              // If no tiles are loaded after a delay, try to add them again
              if (!tilesLoaded) {
                console.log('No tiles detected, re-adding tile layer');
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                  maxZoom: 19,
                  updateWhenIdle: true,
                }).addTo(mapRef.current);
                
                // Ensure view is maintained
                mapRef.current.setView(center, zoom);
              }
            }
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
      
      // Listen for window resize events to re-invalidate the map size
      const handleWindowResize = () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize(true);
        }
      };
      window.addEventListener('resize', handleWindowResize);

      return () => {
        window.removeEventListener('resize', handleWindowResize);
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
          
          // The useEffect will run again on the next render
          // Force a re-render by dispatching a custom event
          document.dispatchEvent(new CustomEvent('mapInitError'));
        }
      }, 2000);
    }
  }, [mapContainerRef, center, zoom]);

  return { mapRef, markersLayerRef, mapCreated: mapCreated.current };
};

export default useMapInitialization;
