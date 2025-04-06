
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

// Import marker icon images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Import custom hooks
import useMapInitialization from './leaflet/useMapInitialization';
import useUserLocationTracking from './leaflet/useUserLocationTracking';
import ThreatMarkers from './leaflet/ThreatMarkers';

// Fix marker icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface ThreatMarker {
  id: string;
  position: [number, number]; // [latitude, longitude]
  level: 'low' | 'medium' | 'high';
  title: string;
  details: string;
  type?: 'cyber' | 'physical' | 'environmental';
}

interface LeafletMapProps {
  className?: string;
  markers?: ThreatMarker[];
  onMarkerClick?: (marker: ThreatMarker) => void;
  center?: [number, number];
  zoom?: number;
  showUserLocation?: boolean;
}

const LeafletMap = forwardRef<L.Map, LeafletMapProps>(({
  className,
  markers = [],
  onMarkerClick,
  center = [40.7128, -74.006],
  zoom = 13,
  showUserLocation = false
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapKey, setMapKey] = useState(Date.now()); // Used to force re-renders if needed
  
  // Initialize map
  const { mapRef, markersLayerRef, mapCreated } = useMapInitialization(
    mapContainerRef,
    center,
    zoom
  );

  // Expose the map instance via the ref
  useImperativeHandle(ref, () => {
    return mapRef.current as L.Map;
  }, [mapRef.current]);

  // Track user location
  const { getUserLocation } = useUserLocationTracking(
    mapRef.current,
    showUserLocation
  );

  // Update markers when they change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !mapCreated || markers.length === 0) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();
    
    markers.forEach(marker => {
      // Set marker color based on threat level and type
      let markerColor = marker.level === 'high' ? 'red' : 
                       marker.level === 'medium' ? 'orange' : 'blue';
      
      if (marker.type) {
        if (marker.type === 'cyber') {
          markerColor = marker.level === 'high' ? '#ff3399' : 
                       marker.level === 'medium' ? '#ff66b2' : '#ff99cc';
        } else if (marker.type === 'environmental') {
          markerColor = marker.level === 'high' ? '#33cc33' : 
                       marker.level === 'medium' ? '#66cc66' : '#99cc99';
        }
      }
      
      const circleRadius = marker.level === 'high' ? 20 : 
                          marker.level === 'medium' ? 15 : 10;
      
      const circle = L.circle(marker.position, {
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.2,
        radius: circleRadius * 50
      }).addTo(markersLayerRef.current!);
      
      const icon = L.divIcon({
        className: `threat-marker-${marker.level}`,
        html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      
      const mapMarker = L.marker(marker.position, { icon }).addTo(markersLayerRef.current!);
      
      const threatType = marker.type ? `<br>${marker.type.toUpperCase()} threat` : '';
      mapMarker.bindPopup(`<b>${marker.title}</b><br>${marker.level.toUpperCase()} threat level${threatType}`);
      
      if (onMarkerClick) {
        mapMarker.on('click', () => onMarkerClick(marker));
        circle.on('click', () => onMarkerClick(marker));
      }
    });
  }, [markers, onMarkerClick, mapCreated]);

  // Ensure the map is properly sized
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        console.log("Resizing map in response to window resize");
        mapRef.current.invalidateSize(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Also do an immediate resize and a delayed one for reliability
    if (mapRef.current && mapCreated) {
      setTimeout(handleResize, 100);
      setTimeout(handleResize, 500);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mapCreated]);

  // Add additional map layers when map is created
  useEffect(() => {
    if (mapRef.current && mapCreated) {
      // Set the base tile layer to OpenStreetMap with more visible street names
      const baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
      
      // Add a more detailed map layer option
      const tonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
        maxZoom: 19,
      });
      
      // Add satellite view option
      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
      });
      
      // Add layer control to toggle between maps
      const baseMaps = {
        "OpenStreetMap": baseMap,
        "Light": tonerLite,
        "Satellite": satellite
      };
      
      L.control.layers(baseMaps).addTo(mapRef.current);
      
      // Set the initial base layer
      baseMap.addTo(mapRef.current);
      
      // Add scale control
      L.control.scale().addTo(mapRef.current);
    }
  }, [mapCreated]);

  return (
    <div 
      ref={mapContainerRef} 
      className={cn("h-full w-full min-h-[300px]", className)}
      id="leaflet-map-container"
      key={`map-container-${mapKey}`}
    />
  );
});

LeafletMap.displayName = 'LeafletMap';

export default LeafletMap;
