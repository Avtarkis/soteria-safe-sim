
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/CardWrapper';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

interface FamilyMember {
  id: string;
  name: string;
  type: 'child' | 'adult' | 'senior';
  location: {
    name: string;
    type: 'home' | 'school' | 'work' | 'other';
    coordinates: [number, number];
    lastUpdated: string;
  };
}

interface FamilyMapProps {
  selectedMember: FamilyMember | null;
  familyMembers: FamilyMember[];
  userLocation?: [number, number] | null;
}

const getMarkerColor = (memberType: string) => {
  switch (memberType) {
    case 'child':
      return 'blue';
    case 'senior':
      return 'purple';
    case 'adult':
    default:
      return 'green';
  }
};

const FamilyMap = ({ selectedMember, familyMembers, userLocation }: FamilyMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{[key: string]: L.Marker}>({});
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: userLocation || [37.7749, -122.4194],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);
    
    // Add attribution
    L.control.attribution({
      position: 'bottomright',
      prefix: 'Soteria Safety App'
    }).addTo(map);
    
    // Store map instance
    mapRef.current = map;
    setMapLoaded(true);
    
    // Add user location marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div class="relative">
                <div class="h-4 w-4 rounded-full bg-blue-500 animate-ping opacity-75 absolute"></div>
                <div class="h-4 w-4 rounded-full bg-blue-500 relative"></div>
              </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      
      L.marker(userLocation, { icon: userIcon })
        .addTo(map)
        .bindTooltip('Your Location');
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLocation]);
  
  // Update markers when family members change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove();
    });
    
    markersRef.current = {};
    
    // Add markers for each family member
    familyMembers.forEach(member => {
      if (!member.location.coordinates || !mapRef.current) return;
      
      const color = getMarkerColor(member.type);
      
      const markerIcon = L.divIcon({
        className: `family-marker ${member.id === selectedMember?.id ? 'selected' : ''}`,
        html: `<div class="relative">
                <div class="h-6 w-6 rounded-full bg-${color}-100 flex items-center justify-center border-2 border-${color}-500">
                  <div class="h-2 w-2 rounded-full bg-${color}-500"></div>
                </div>
                ${member.id === selectedMember?.id ? 
                  `<div class="h-10 w-10 rounded-full border-2 border-${color}-500 animate-ping opacity-50 absolute -top-2 -left-2"></div>` : ''}
              </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      const marker = L.marker(member.location.coordinates, { icon: markerIcon })
        .addTo(mapRef.current)
        .bindTooltip(member.name);
        
      markersRef.current[member.id] = marker;
    });
  }, [familyMembers, selectedMember, mapLoaded]);
  
  // Center map on selected member
  useEffect(() => {
    if (!mapRef.current || !selectedMember?.location.coordinates) return;
    
    mapRef.current.setView(selectedMember.location.coordinates, 14, {
      animate: true,
      duration: 1
    });
    
    // Highlight the selected member's marker
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const isSelected = id === selectedMember.id;
      const color = getMarkerColor(
        familyMembers.find(m => m.id === id)?.type || 'adult'
      );
      
      const markerIcon = L.divIcon({
        className: `family-marker ${isSelected ? 'selected' : ''}`,
        html: `<div class="relative">
                <div class="h-6 w-6 rounded-full bg-${color}-100 flex items-center justify-center border-2 border-${color}-500">
                  <div class="h-2 w-2 rounded-full bg-${color}-500"></div>
                </div>
                ${isSelected ? 
                  `<div class="h-10 w-10 rounded-full border-2 border-${color}-500 animate-ping opacity-50 absolute -top-2 -left-2"></div>` : ''}
              </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      marker.setIcon(markerIcon);
    });
  }, [selectedMember, familyMembers]);

  return (
    <div className="relative w-full h-full">
      {!mapLoaded && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2">Loading map...</span>
        </div>
      )}
      <div 
        ref={mapContainerRef}
        className="w-full h-full min-h-[200px] rounded-lg overflow-hidden"
        style={{ zIndex: 0 }}
      />
      
      {/* Add custom controls */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-background/80 backdrop-blur-sm p-2 rounded-md shadow">
        <div className="flex space-x-2">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
            <span className="text-xs">Child</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
            <span className="text-xs">Adult</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-purple-500 mr-1"></div>
            <span className="text-xs">Senior</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyMap;
