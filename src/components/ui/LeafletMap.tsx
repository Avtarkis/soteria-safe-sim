
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

// Import marker icon images (Leaflet requires these)
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
  type?: 'cyber' | 'physical' | 'environmental'; // Add type to categorize threats
}

interface LeafletMapProps {
  className?: string;
  markers?: ThreatMarker[];
  onMarkerClick?: (marker: ThreatMarker) => void;
  center?: [number, number]; // [latitude, longitude]
  zoom?: number;
  showUserLocation?: boolean;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  className,
  markers = [],
  onMarkerClick,
  center = [40.7128, -74.006], // Default to New York City
  zoom = 13,
  showUserLocation = false
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);
  const userLocationAccuracyRef = useRef<number>(0);
  const userLocationLatLngRef = useRef<L.LatLng | null>(null);
  const [mapCreated, setMapCreated] = useState(false);

  // Initialize map
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
  }, [center, zoom]);

  // Handle user location tracking separately
  useEffect(() => {
    if (!mapRef.current || !mapCreated) return;
    
    // Define user location icon with pulsing effect
    const createPulsingIcon = () => {
      // Create styles for the pulsing effect
      const pulsingCSS = `
        @keyframes pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .pulse-circle {
          animation: pulse 1.5s infinite ease-out;
        }
      `;
      
      // Add the CSS to the document if it doesn't exist
      if (!document.getElementById('pulsing-marker-css')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'pulsing-marker-css';
        styleElement.textContent = pulsingCSS;
        document.head.appendChild(styleElement);
      }
      
      const customIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <div style="background-color: #4F46E5; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); position: absolute; top: 12px; left: 12px; z-index: 2;"></div>
            <div class="pulse-circle" style="background-color: rgba(79, 70, 229, 0.3); width: 40px; height: 40px; border-radius: 50%; position: absolute; top: 0; left: 0; z-index: 1;"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      return customIcon;
    };

    // Handle location found event
    const handleLocationFound = (e: L.LocationEvent) => {
      console.log("Location found:", e);
      const radius = e.accuracy;
      userLocationAccuracyRef.current = radius;
      userLocationLatLngRef.current = e.latlng;
      
      // Remove previous markers if they exist
      if (userLocationMarkerRef.current) {
        mapRef.current?.removeLayer(userLocationMarkerRef.current);
      }
      if (userLocationCircleRef.current) {
        mapRef.current?.removeLayer(userLocationCircleRef.current);
      }
      
      // Add marker for user location
      const pulsingIcon = createPulsingIcon();
      userLocationMarkerRef.current = L.marker(e.latlng, { icon: pulsingIcon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <b>Your Current Location</b><br>
          Lat: ${e.latlng.lat.toFixed(6)}<br>
          Lng: ${e.latlng.lng.toFixed(6)}<br>
          Accuracy: ±${radius.toFixed(1)} meters
        `);

      // Add circle showing accuracy radius
      userLocationCircleRef.current = L.circle(e.latlng, {
        radius: radius,
        color: '#4F46E5',
        fillColor: '#4F46E5',
        fillOpacity: 0.1,
        weight: 1
      }).addTo(mapRef.current!);
      
      // Automatically open the popup when first locating
      userLocationMarkerRef.current.openPopup();

      // Custom event that components can listen to
      const customEvent = new CustomEvent('userLocationUpdated', {
        detail: {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          accuracy: radius
        }
      });
      document.dispatchEvent(customEvent);
    };

    // Handle location error
    const handleLocationError = (e: L.ErrorEvent) => {
      console.error('Location error:', e.message);
      
      // Try to use navigator.geolocation as a fallback
      if (navigator.geolocation) {
        console.log("Trying fallback geolocation");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!mapRef.current) return;
            
            const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
            const accuracy = position.coords.accuracy;
            
            // Manually create a locationfound event
            const locationEvent = {
              latlng,
              accuracy,
              timestamp: position.timestamp,
              bounds: L.latLngBounds(
                [position.coords.latitude - 0.01, position.coords.longitude - 0.01],
                [position.coords.latitude + 0.01, position.coords.longitude + 0.01]
              )
            } as L.LocationEvent;
            
            // Trigger the locationfound event handler
            handleLocationFound(locationEvent);
          },
          (error) => {
            console.error('Geolocation error:', error.message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
      }
    };

    // Set up event handlers
    mapRef.current.on('locationfound', handleLocationFound);
    mapRef.current.on('locationerror', handleLocationError);

    // Start location tracking if requested
    if (showUserLocation) {
      console.log("Starting location tracking");
      mapRef.current.locate({ 
        setView: true, 
        maxZoom: 16, 
        watch: true,
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      });
    }

    return () => {
      if (mapRef.current) {
        // Clean up event handlers when component unmounts
        mapRef.current.off('locationfound', handleLocationFound);
        mapRef.current.off('locationerror', handleLocationError);
      }
    };
  }, [mapCreated, showUserLocation]);

  // Update markers when they change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !mapCreated) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    markers.forEach(marker => {
      // Set marker color based on threat level and type
      let markerColor = marker.level === 'high' ? 'red' : 
                        marker.level === 'medium' ? 'orange' : 'blue';
      
      // Adjust color based on threat type if specified
      if (marker.type) {
        if (marker.type === 'cyber') {
          markerColor = marker.level === 'high' ? '#ff3399' : 
                        marker.level === 'medium' ? '#ff66b2' : '#ff99cc';
        } else if (marker.type === 'environmental') {
          markerColor = marker.level === 'high' ? '#33cc33' : 
                        marker.level === 'medium' ? '#66cc66' : '#99cc99';
        }
        // physical threats use the default red/orange/blue scheme
      }
      
      // Create circle marker with appropriate styling based on threat level
      const circleRadius = marker.level === 'high' ? 20 : 
                          marker.level === 'medium' ? 15 : 10;
      
      // Add threat zone visualization (circle)
      const circle = L.circle(marker.position, {
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.2,
        radius: circleRadius * 50 // Scaled for visibility
      }).addTo(markersLayerRef.current!);
      
      // Add marker at the center of threat zone
      const icon = L.divIcon({
        className: `threat-marker-${marker.level}`,
        html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      
      const mapMarker = L.marker(marker.position, { icon }).addTo(markersLayerRef.current!);
      
      // Add popup with basic info
      const threatType = marker.type ? `<br>${marker.type.toUpperCase()} threat` : '';
      mapMarker.bindPopup(`<b>${marker.title}</b><br>${marker.level.toUpperCase()} threat level${threatType}`);
      
      // Add click handler
      if (onMarkerClick) {
        mapMarker.on('click', () => onMarkerClick(marker));
        circle.on('click', () => onMarkerClick(marker));
      }
    });
  }, [markers, onMarkerClick, mapCreated]);

  // Method to get current user location (can be exposed if needed)
  const getUserLocation = (): [number, number] | null => {
    if (userLocationLatLngRef.current) {
      return [userLocationLatLngRef.current.lat, userLocationLatLngRef.current.lng];
    }
    return null;
  };

  return (
    <div 
      ref={mapContainerRef} 
      className={cn("h-full w-full min-h-[300px]", className)}
      id="leaflet-map-container"
    />
  );
};

export default LeafletMap;
