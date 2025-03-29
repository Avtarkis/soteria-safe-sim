
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

// Import marker icon images (Leaflet requires these)
// We need to manually set these because of how bundlers work with Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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
}

interface LeafletMapProps {
  className?: string;
  markers?: ThreatMarker[];
  onMarkerClick?: (marker: ThreatMarker) => void;
  center?: [number, number]; // [latitude, longitude]
  zoom?: number;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  className,
  markers = [],
  onMarkerClick,
  center = [40.7128, -74.006], // Default to New York City
  zoom = 13
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);
      
      // Add the tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Create a layer group for the markers
      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    } else {
      // Update the map view if center or zoom changed
      mapRef.current.setView(center, zoom);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    markers.forEach(marker => {
      const markerColor = marker.level === 'high' ? 'red' : 
                         marker.level === 'medium' ? 'orange' : 'blue';
      
      // Create circle marker with appropriate styling based on threat level
      const circleRadius = marker.level === 'high' ? 20 : 
                          marker.level === 'medium' ? 15 : 10;
      
      // Add threat zone visualization (circle)
      const circle = L.circle(marker.position, {
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.2,
        radius: circleRadius * 50 // Scaled for visibility
      }).addTo(markersLayerRef.current);
      
      // Add marker at the center of threat zone
      const icon = L.divIcon({
        className: `threat-marker-${marker.level}`,
        html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      
      const mapMarker = L.marker(marker.position, { icon }).addTo(markersLayerRef.current);
      
      // Add popup with basic info
      mapMarker.bindPopup(`<b>${marker.title}</b><br>${marker.level.toUpperCase()} threat level`);
      
      // Add click handler
      if (onMarkerClick) {
        mapMarker.on('click', () => onMarkerClick(marker));
        circle.on('click', () => onMarkerClick(marker));
      }
    });
  }, [markers, onMarkerClick]);

  return (
    <div 
      ref={mapContainerRef} 
      className={cn("h-full w-full min-h-[300px]", className)}
    />
  );
};

export default LeafletMap;
