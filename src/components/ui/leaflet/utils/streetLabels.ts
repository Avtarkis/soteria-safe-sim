
import L from 'leaflet';

// Timeout reference for debouncing street lookup
let streetLookupTimeoutRef: NodeJS.Timeout | null = null;

/**
 * Fetches and adds street label to the map
 */
export const addStreetLabels = async (
  map: L.Map | null, 
  latlng: L.LatLng,
  userLocationAccuracy: number,
  streetLabelRef: React.MutableRefObject<L.Marker | null>
): Promise<void> => {
  if (!map) return;
  
  try {
    // Remove existing label if any
    if (streetLabelRef.current) {
      map.removeLayer(streetLabelRef.current);
      streetLabelRef.current = null;
    }
    
    // Clear any pending lookups
    if (streetLookupTimeoutRef) {
      clearTimeout(streetLookupTimeoutRef);
    }
    
    // Debounce to prevent too many API calls
    streetLookupTimeoutRef = setTimeout(async () => {
      try {
        // Fetch location data from OpenStreetMap
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        let streetName = '';
        
        if (data.address) {
          const { road, street, pedestrian, path, footway, residential, house_number, suburb, neighbourhood } = data.address;
          
          const streetInfo = road || street || pedestrian || path || footway || residential || '';
          const houseNum = house_number ? `${house_number}, ` : '';
          const areaInfo = suburb || neighbourhood || '';
          
          if (streetInfo) {
            streetName = `${houseNum}${streetInfo}`;
            
            if (areaInfo) {
              streetName += `, ${areaInfo}`;
            }
          } else if (data.name) {
            streetName = data.name;
          } else {
            const locality = data.address.suburb || data.address.neighbourhood || '';
            if (locality) {
              streetName = locality;
            }
          }
        }
        
        if (!streetName && data.display_name) {
          streetName = data.display_name.split(',').slice(0, 2).join(',');
        }
        
        if (streetName) {
          // Create a custom street label
          const streetLabelIcon = L.divIcon({
            className: 'street-label-container',
            html: `<div class="street-label">${streetName}</div>`,
            iconSize: [200, 30],
            iconAnchor: [100, 45]
          });
          
          // Position label slightly above the user location marker
          const labelLatLng = L.latLng(latlng.lat + 0.0002, latlng.lng);
          streetLabelRef.current = L.marker(labelLatLng, { 
            icon: streetLabelIcon, 
            interactive: true,
            zIndexOffset: 1000
          }).addTo(map);
          
          // Add popup with more details
          streetLabelRef.current.bindPopup(`
            <b>${streetName}</b><br>
            Coordinates: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}<br>
            Accuracy: ±${userLocationAccuracy < 1 ? 
              userLocationAccuracy.toFixed(2) : 
              userLocationAccuracy.toFixed(1)} meters
          `);
        }
      } catch (error) {
        console.error("Error adding street label:", error);
      }
    }, 300);
  } catch (error) {
    console.error("Error in addStreetLabels:", error);
  }
};

/**
 * Cleanup function for street labels
 */
export const cleanupStreetLabels = (): void => {
  if (streetLookupTimeoutRef) {
    clearTimeout(streetLookupTimeoutRef);
    streetLookupTimeoutRef = null;
  }
};
