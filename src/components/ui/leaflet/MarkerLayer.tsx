
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';

interface MarkerLayerProps {
  map: L.Map | null;
  markers: ThreatMarker[];
  onMarkerClick?: (marker: ThreatMarker) => void;
}

const MarkerLayer = ({
  map,
  markers,
  onMarkerClick
}: MarkerLayerProps) => {
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  // Create markers layer when component mounts
  useEffect(() => {
    if (!map) return;
    
    // Create markers layer if not already created
    if (!markersLayerRef.current) {
      markersLayerRef.current = L.layerGroup().addTo(map);
    }
    
    // Cleanup when component unmounts
    return () => {
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
        map.removeLayer(markersLayerRef.current);
        markersLayerRef.current = null;
      }
    };
  }, [map]);
  
  // Update markers when they change
  useEffect(() => {
    if (!map || !markersLayerRef.current || markers.length === 0) return;

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
  }, [map, markers, onMarkerClick]);
  
  return null; // This is a non-visual component
};

export default MarkerLayer;
