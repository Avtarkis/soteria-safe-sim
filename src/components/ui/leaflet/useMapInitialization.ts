
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export const useMapInitialization = (
  mapContainerRef: React.RefObject<HTMLDivElement>,
  center: [number, number],
  zoom: number
) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapCreated, setMapCreated] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      console.log("Initializing map...");
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);
      
      // Add the tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Create a layer group for the markers
      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
      
      setMapCreated(true);
    } else {
      // Update the map view if center or zoom changed
      mapRef.current.setView(center, zoom);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.stopLocate(); // Stop watching location
      }
    };
  }, [center, zoom, mapContainerRef]);

  return {
    mapRef,
    markersLayerRef,
    mapCreated
  };
};

export default useMapInitialization;
