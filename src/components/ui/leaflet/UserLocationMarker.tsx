
import React, { useEffect, useState } from 'react';
import L from 'leaflet';

interface UserLocationMarkerProps {
  map: L.Map;
  latlng: L.LatLng;
  accuracy: number;
}

export const createPulsingIcon = () => {
  // Create styles for the pulsing effect if they don't exist
  if (!document.getElementById('pulsing-marker-css')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'pulsing-marker-css';
    styleElement.textContent = `
      @keyframes pulse {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      .pulse-circle {
        animation: pulse 1.5s infinite ease-out;
      }
      .double-pulse-circle {
        position: absolute;
        top: 0;
        left: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(79, 70, 229, 0.3);
        z-index: 1;
      }
      .double-pulse-circle:nth-child(1) {
        animation: pulse 2s infinite ease-out;
      }
      .double-pulse-circle:nth-child(2) {
        animation: pulse 2s infinite ease-out 1s;
      }
      .location-dot {
        position: absolute;
        top: 12px;
        left: 12px;
        width: 16px;
        height: 16px;
        background-color: #4F46E5;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        z-index: 2;
      }
      .street-label {
        background-color: rgba(255, 255, 255, 0.95);
        padding: 6px 10px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 13px;
        white-space: nowrap;
        border: 2px solid rgba(79, 70, 229, 0.6);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        color: #333;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        z-index: 1000;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Create an improved pulsing icon with double pulse animation
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        <div class="location-dot"></div>
        <div class="double-pulse-circle"></div>
        <div class="double-pulse-circle"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ map, latlng, accuracy }) => {
  const [streetName, setStreetName] = useState<string | null>(null);
  
  // Get street name using reverse geocoding
  useEffect(() => {
    const fetchStreetName = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        // Extract street name or nearest named feature
        let locationName = '';
        
        if (data.address) {
          const { road, street, pedestrian, path, footway, residential, house_number, city, county, state, country, suburb, neighbourhood } = data.address;
          
          // Try to get the most specific street information
          const streetInfo = road || street || pedestrian || path || footway || residential || '';
          const houseNum = house_number ? `${house_number}, ` : '';
          const areaInfo = suburb || neighbourhood || '';
          
          if (streetInfo) {
            locationName = `${houseNum}${streetInfo}`;
            
            // Add area/city if available
            if (areaInfo) {
              locationName += `, ${areaInfo}`;
            } else if (city) {
              locationName += `, ${city}`;
            } else if (county) {
              locationName += `, ${county}`;
            }
          } else if (data.name) {
            locationName = data.name;
            if (city || county) {
              locationName += `, ${city || county}`;
            }
          } else {
            // Use any other available location data if street name not found
            const locality = suburb || neighbourhood || city || county || '';
            if (locality) {
              locationName = locality;
              if (state) locationName += `, ${state}`;
            } else if (state) {
              locationName = `${state}, ${country || ''}`.trim();
            }
          }
        }
        
        // If we couldn't find a street name, use the display_name but shortened
        if (!locationName && data.display_name) {
          locationName = data.display_name.split(',').slice(0, 2).join(',');
        }
        
        setStreetName(locationName || 'Your Location');
      } catch (error) {
        console.error("Error fetching street name:", error);
        setStreetName('Your Current Location');
      }
    };
    
    fetchStreetName();
  }, [latlng.lat, latlng.lng]);

  useEffect(() => {
    // Create marker and circle when component mounts
    let marker: L.Marker | null = null;
    let circle: L.Circle | null = null;
    let streetLabel: L.Marker | null = null;
    
    try {
      // Create the main location marker
      marker = L.marker(latlng, { icon: createPulsingIcon() })
        .addTo(map)
        .bindPopup(`
          <b>Your Exact Location</b><br>
          ${streetName ? `Location: ${streetName}<br>` : ''}
          Lat: ${latlng.lat.toFixed(8)}<br>
          Lng: ${latlng.lng.toFixed(8)}<br>
          Accuracy: ±${accuracy < 1 ? accuracy.toFixed(2) : accuracy.toFixed(1)} meters
        `);

      // Add circle showing accuracy radius
      circle = L.circle(latlng, {
        radius: accuracy,
        color: '#4F46E5',
        fillColor: '#4F46E5',
        fillOpacity: 0.1,
        weight: 2
      }).addTo(map);
      
      // Add street name label if available - always show it when high precision is enabled
      if (streetName) {
        const streetLabelIcon = L.divIcon({
          className: 'street-label-container',
          html: `<div class="street-label">${streetName}</div>`,
          iconSize: [200, 30],
          iconAnchor: [100, 45] // Position it above the marker
        });
        
        // Position the street label above the location marker
        // Use a slight offset to ensure it's visible
        const labelLatLng = L.latLng(latlng.lat + 0.0002, latlng.lng);
        streetLabel = L.marker(labelLatLng, { 
          icon: streetLabelIcon, 
          interactive: true,
          zIndexOffset: 1000 // Make sure label is on top
        }).addTo(map);
        
        // Make the label clickable to show more details
        streetLabel.bindPopup(`
          <b>${streetName}</b><br>
          Coordinates: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}<br>
          Accuracy: ±${accuracy < 1 ? accuracy.toFixed(2) : accuracy.toFixed(1)} meters
        `);
      }
      
      // Clean up when component unmounts
      return () => {
        try {
          if (marker) map.removeLayer(marker);
          if (circle) map.removeLayer(circle);
          if (streetLabel) map.removeLayer(streetLabel);
        } catch (error) {
          console.error("Error cleaning up marker/circle/label:", error);
        }
      };
    } catch (error) {
      console.error("Error creating location marker:", error);
      return undefined;
    }
  }, [map, latlng, accuracy, streetName]);
  
  // Return null as this is a side-effect component
  return null;
};

export default UserLocationMarker;
