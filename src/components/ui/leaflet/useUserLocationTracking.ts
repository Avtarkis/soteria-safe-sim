
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { createPulsingIcon } from './UserLocationMarker';

export const useUserLocationTracking = (
  map: L.Map | null,
  showUserLocation: boolean,
  setUserLocation?: (location: [number, number]) => void
) => {
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);
  const userLocationAccuracyRef = useRef<number>(0);
  const userLocationLatLngRef = useRef<L.LatLng | null>(null);
  const streetLabelRef = useRef<L.Marker | null>(null);
  const locationTrackingInitializedRef = useRef<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const lastEventTimeRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);
  const highPrecisionModeRef = useRef<boolean>(false);
  const streetLookupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add street labels to the map
  const addStreetLabels = async (latlng: L.LatLng) => {
    if (!map) return;
    
    try {
      // Remove existing street label
      if (streetLabelRef.current) {
        map.removeLayer(streetLabelRef.current);
        streetLabelRef.current = null;
      }
      
      // Clear any existing timeout
      if (streetLookupTimeoutRef.current) {
        clearTimeout(streetLookupTimeoutRef.current);
      }
      
      // Set timeout to avoid too many API calls
      streetLookupTimeoutRef.current = setTimeout(async () => {
        try {
          // Get street name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          // Extract street name or nearest named feature
          let streetName = '';
          
          if (data.address) {
            const { road, street, pedestrian, path, footway, residential, house_number, suburb, neighbourhood } = data.address;
            
            // Try to get the most specific street information
            const streetInfo = road || street || pedestrian || path || footway || residential || '';
            const houseNum = house_number ? `${house_number}, ` : '';
            const areaInfo = suburb || neighbourhood || '';
            
            if (streetInfo) {
              streetName = `${houseNum}${streetInfo}`;
              
              // Add area info if available
              if (areaInfo) {
                streetName += `, ${areaInfo}`;
              }
            } else if (data.name) {
              streetName = data.name;
            } else {
              // Use any other available location data if street name not found
              const locality = data.address.suburb || data.address.neighbourhood || '';
              if (locality) {
                streetName = locality;
              }
            }
          }
          
          // If we couldn't find a street name, use the display_name but shortened
          if (!streetName && data.display_name) {
            streetName = data.display_name.split(',').slice(0, 2).join(',');
          }
          
          // If we have a street name, add it to the map
          if (streetName) {
            const streetLabelIcon = L.divIcon({
              className: 'street-label-container',
              html: `<div class="street-label">${streetName}</div>`,
              iconSize: [200, 30],
              iconAnchor: [100, 45] // Position it above the marker
            });
            
            // Position the street label above the location marker
            const labelLatLng = L.latLng(latlng.lat + 0.0002, latlng.lng);
            streetLabelRef.current = L.marker(labelLatLng, { 
              icon: streetLabelIcon, 
              interactive: true,
              zIndexOffset: 1000 // Make sure label is on top
            }).addTo(map);
            
            // Make the label clickable to show more details
            streetLabelRef.current.bindPopup(`
              <b>${streetName}</b><br>
              Coordinates: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}<br>
              Accuracy: ±${userLocationAccuracyRef.current < 1 ? 
                userLocationAccuracyRef.current.toFixed(2) : 
                userLocationAccuracyRef.current.toFixed(1)} meters
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

  // Handle location found event with improved error handling
  const handleLocationFound = (e: L.LocationEvent) => {
    try {
      if (!map) return;
      
      // Allow more frequent updates for better tracking - 300ms minimum interval
      const now = Date.now();
      if (now - lastEventTimeRef.current < 300) {
        return;
      }
      lastEventTimeRef.current = now;
      
      console.log("High-precision location found:", e);
      const radius = e.accuracy;
      userLocationAccuracyRef.current = radius;
      userLocationLatLngRef.current = e.latlng;
      
      // Remove previous markers if they exist
      if (userLocationMarkerRef.current) {
        try {
          map.removeLayer(userLocationMarkerRef.current);
        } catch (error) {
          console.error("Error removing marker:", error);
        }
      }
      if (userLocationCircleRef.current) {
        try {
          map.removeLayer(userLocationCircleRef.current);
        } catch (error) {
          console.error("Error removing circle:", error);
        }
      }
      
      // Add marker for user location with the pulsing icon
      try {
        const pulsingIcon = createPulsingIcon();
        userLocationMarkerRef.current = L.marker(e.latlng, { icon: pulsingIcon })
          .addTo(map)
          .bindPopup(`
            <b>Your Exact Location</b><br>
            Lat: ${e.latlng.lat.toFixed(8)}<br>
            Lng: ${e.latlng.lng.toFixed(8)}<br>
            Accuracy: ±${radius < 1 ? radius.toFixed(2) : radius.toFixed(1)} meters
          `);

        // Add circle showing accuracy radius
        userLocationCircleRef.current = L.circle(e.latlng, {
          radius: radius,
          color: '#4F46E5',
          fillColor: '#4F46E5',
          fillOpacity: 0.1,
          weight: 2
        }).addTo(map);
        
        // Add street labels
        addStreetLabels(e.latlng);
        
        // Center map on user location with appropriate zoom level based on accuracy
        // Only center if high precision tracking is enabled or it's the first location
        if (highPrecisionModeRef.current || !locationTrackingInitializedRef.current) {
          // Use higher zoom for more precise location
          const zoomLevel = radius < 10 ? 19 : 
                          radius < 30 ? 18 : 
                          radius < 100 ? 17 : 16;
          
          map.setView(e.latlng, zoomLevel, { animate: true });
          
          // Add street labels to the map when initially centering
          addStreetLabels(e.latlng);
          
          // Only reset high precision mode after the first centering
          if (locationTrackingInitializedRef.current) {
            highPrecisionModeRef.current = false;
          }
        }
        
        locationTrackingInitializedRef.current = true;
        
        // Reset error count on successful update
        errorCountRef.current = 0;
      } catch (error) {
        console.error("Error creating markers:", error);
        errorCountRef.current++;
      }
      
      // Update user location through callback if provided
      if (setUserLocation) {
        setUserLocation([e.latlng.lat, e.latlng.lng]);
      }

      // Dispatch custom event so other components can react to location updates
      try {
        const customEvent = new CustomEvent('userLocationUpdated', {
          detail: {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            accuracy: radius
          }
        });
        document.dispatchEvent(customEvent);
      } catch (error) {
        console.error("Error dispatching location event:", error);
      }
    } catch (error) {
      console.error("Error in handleLocationFound:", error);
      errorCountRef.current++;
      
      // If we hit too many errors, stop tracking to prevent blank screen
      if (errorCountRef.current > 5) {
        console.error("Too many errors during location tracking, stopping to prevent crashes");
        try {
          if (map && map.stopLocate) {
            map.stopLocate();
          }
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
        } catch (e) {
          console.error("Error stopping location services:", e);
        }
      }
    }
  };

  // Listen for high precision mode activation
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      highPrecisionModeRef.current = true;
      
      // Dispatch event to notify about high precision mode
      document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
      
      // If we have a location, add street labels
      if (userLocationLatLngRef.current) {
        addStreetLabels(userLocationLatLngRef.current);
      }
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    };
  }, [map]);

  // Handle location error with better fallback
  const handleLocationError = (e: L.ErrorEvent) => {
    console.error('Location error:', e.message);
    
    // Try to use navigator.geolocation as a fallback with maximum accuracy
    if (navigator.geolocation) {
      console.log("Trying fallback geolocation with high accuracy");
      if (watchIdRef.current === null) {
        try {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              if (!map) return;
              
              const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
              const accuracy = position.coords.accuracy;
              
              // Manually create a locationfound event
              const locationEvent = {
                latlng,
                accuracy,
                timestamp: position.timestamp,
                bounds: L.latLngBounds(
                  [position.coords.latitude - 0.0001, position.coords.longitude - 0.0001],
                  [position.coords.latitude + 0.0001, position.coords.longitude + 0.0001]
                )
              } as L.LocationEvent;
              
              // Trigger the locationfound event handler
              handleLocationFound(locationEvent);
            },
            (error) => {
              console.error('Geolocation error:', error.message);
              errorCountRef.current++;
            },
            { 
              enableHighAccuracy: true, 
              timeout: 15000, 
              maximumAge: 0 // Don't use cached positions
            }
          );
        } catch (error) {
          console.error("Error setting up geolocation watch:", error);
        }
      }
    }
  };

  // Start or stop location tracking based on showUserLocation
  useEffect(() => {
    try {
      if (!map) return;
      
      // Set up event handlers
      map.on('locationfound', handleLocationFound);
      map.on('locationerror', handleLocationError);
      
      // Prevent duplicate initialization if tracking status hasn't changed
      if (showUserLocation && !isTracking) {
        console.log("Starting high-precision location tracking");
        
        // Signal that we need to center the map immediately
        highPrecisionModeRef.current = true;
        
        // Stop any existing tracking first to ensure clean state
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        
        if (map.stopLocate) {
          map.stopLocate();
        }
        
        // Start tracking with highest accuracy settings
        map.locate({ 
          setView: false, // Don't set view automatically, we'll do it manually
          maxZoom: 19, 
          watch: true,
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
        
        // Use navigator.geolocation for maximum accuracy
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Initial high-precision position:", position);
            
            // Immediately create a marker if we have position
            if (map && position) {
              const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
              const locationEvent = {
                latlng,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
                bounds: L.latLngBounds(
                  [position.coords.latitude - 0.0001, position.coords.longitude - 0.0001],
                  [position.coords.latitude + 0.0001, position.coords.longitude + 0.0001]
                )
              } as L.LocationEvent;
              
              handleLocationFound(locationEvent);
              
              // Dispatch event to use high precision mode
              document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
            }
          },
          (error) => {
            console.error("Error getting initial position:", error);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 
          }
        );
        
        // Also use the native geolocation API for redundancy and better accuracy
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            if (!map) return;
            
            const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
            const accuracy = position.coords.accuracy;
            
            // Manually create a locationfound event
            const locationEvent = {
              latlng,
              accuracy,
              timestamp: position.timestamp,
              bounds: L.latLngBounds(
                [position.coords.latitude - 0.0001, position.coords.longitude - 0.0001],
                [position.coords.latitude + 0.0001, position.coords.longitude + 0.0001]
              )
            } as L.LocationEvent;
            
            // Trigger the locationfound event handler
            handleLocationFound(locationEvent);
          },
          (error) => {
            console.error('Geolocation watch error:', error.message);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 0 
          }
        );
        
        locationTrackingInitializedRef.current = true;
        setIsTracking(true);
      } else if (!showUserLocation && isTracking) {
        console.log("Stopping location tracking");
        
        // Remove markers when tracking is turned off
        if (userLocationMarkerRef.current) {
          try {
            map.removeLayer(userLocationMarkerRef.current);
            userLocationMarkerRef.current = null;
          } catch (error) {
            console.error("Error removing marker on toggle off:", error);
          }
        }
        if (userLocationCircleRef.current) {
          try {
            map.removeLayer(userLocationCircleRef.current);
            userLocationCircleRef.current = null;
          } catch (error) {
            console.error("Error removing circle on toggle off:", error);
          }
        }
        if (streetLabelRef.current) {
          try {
            map.removeLayer(streetLabelRef.current);
            streetLabelRef.current = null;
          } catch (error) {
            console.error("Error removing street label on toggle off:", error);
          }
        }
        
        // Stop tracking
        map.stopLocate();
        
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        
        setIsTracking(false);
      }

      return () => {
        if (map) {
          try {
            // Clean up event handlers when component unmounts
            map.off('locationfound', handleLocationFound);
            map.off('locationerror', handleLocationError);
            
            // Clear watch position if using navigator
            if (watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
            }
            
            // Clear any pending timeouts
            if (streetLookupTimeoutRef.current) {
              clearTimeout(streetLookupTimeoutRef.current);
            }
          } catch (error) {
            console.error("Error cleaning up location tracking:", error);
          }
        }
      };
    } catch (error) {
      console.error("Error in location tracking effect:", error);
    }
  }, [map, showUserLocation, setUserLocation, isTracking]);

  // Listen for centerMapOnUserLocation events
  useEffect(() => {
    const handleCenterMap = () => {
      if (map && userLocationLatLngRef.current) {
        // Signal that we need to center with high precision
        highPrecisionModeRef.current = true;
        
        // Force a location update with high zoom
        map.locate({ 
          setView: false,
          maxZoom: 19, 
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
        
        // Center map on user location
        map.setView(userLocationLatLngRef.current, 18, { animate: true });
        
        // Add street labels to the map
        addStreetLabels(userLocationLatLngRef.current);
      }
    };

    document.addEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    
    return () => {
      document.removeEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    };
  }, [map]);

  return {
    getUserLocation: (): [number, number] | null => {
      if (userLocationLatLngRef.current) {
        return [userLocationLatLngRef.current.lat, userLocationLatLngRef.current.lng];
      }
      return null;
    },
    locationAccuracy: userLocationAccuracyRef.current
  };
};

export default useUserLocationTracking;
