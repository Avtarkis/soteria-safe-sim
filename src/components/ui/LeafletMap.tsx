
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
import { createPulsingIcon, determineSafetyLevel } from './leaflet/UserLocationMarker';

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

  // Track user location with safety level
  const { getUserLocation } = useUserLocationTracking(
    mapRef.current,
    showUserLocation, 
    undefined, 
    markers
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

  // Add CSS for pulsing effect to the document
  useEffect(() => {
    // Add the CSS style for the pulsing marker if not already present
    if (!document.getElementById('pulsing-marker-style')) {
      const style = document.createElement('style');
      style.id = 'pulsing-marker-style';
      style.innerHTML = `
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          70% {
            transform: scale(2);
            opacity: 0.3;
          }
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }
        .user-marker-pulse {
          animation: pulse 2s infinite;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Clean up the style when component unmounts
      const styleElem = document.getElementById('pulsing-marker-style');
      if (styleElem) {
        styleElem.remove();
      }
    };
  }, []);

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
