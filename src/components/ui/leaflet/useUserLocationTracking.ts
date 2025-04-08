import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { createPulsingIcon, determineSafetyLevel } from './UserLocationMarker';

export const useUserLocationTracking = (
  map: L.Map | null,
  showUserLocation: boolean,
  setUserLocation?: (location: [number, number]) => void,
  threatMarkers: any[] = []
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
  const safetyLevelRef = useRef<'safe' | 'caution' | 'danger'>('safe');

  const addStreetLabels = async (latlng: L.LatLng) => {
    if (!map) return;
    
    try {
      if (streetLabelRef.current) {
        map.removeLayer(streetLabelRef.current);
        streetLabelRef.current = null;
      }
      
      if (streetLookupTimeoutRef.current) {
        clearTimeout(streetLookupTimeoutRef.current);
      }
      
      streetLookupTimeoutRef.current = setTimeout(async () => {
        try {
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
            const streetLabelIcon = L.divIcon({
              className: 'street-label-container',
              html: `<div class="street-label">${streetName}</div>`,
              iconSize: [200, 30],
              iconAnchor: [100, 45]
            });
            
            const labelLatLng = L.latLng(latlng.lat + 0.0002, latlng.lng);
            streetLabelRef.current = L.marker(labelLatLng, { 
              icon: streetLabelIcon, 
              interactive: true,
              zIndexOffset: 1000
            }).addTo(map);
            
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

  const handleLocationFound = (e: L.LocationEvent) => {
    try {
      if (!map) return;
      
      const now = Date.now();
      if (now - lastEventTimeRef.current < 300) {
        return;
      }
      lastEventTimeRef.current = now;
      
      console.log("High-precision location found:", e);
      const radius = e.accuracy;
      userLocationAccuracyRef.current = radius;
      userLocationLatLngRef.current = e.latlng;
      
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
      
      if (threatMarkers && threatMarkers.length > 0) {
        safetyLevelRef.current = determineSafetyLevel(
          [e.latlng.lat, e.latlng.lng],
          threatMarkers
        );
      }
      
      try {
        const pulsingIcon = createPulsingIcon(safetyLevelRef.current);
        userLocationMarkerRef.current = L.marker(e.latlng, { icon: pulsingIcon })
          .addTo(map)
          .bindPopup(`
            <b>Your Exact Location</b><br>
            Lat: ${e.latlng.lat.toFixed(8)}<br>
            Lng: ${e.latlng.lng.toFixed(8)}<br>
            Accuracy: ±${radius < 1 ? radius.toFixed(2) : radius.toFixed(1)} meters
          `);

        const circleColor = safetyLevelRef.current === 'safe' ? '#4F46E5' : 
                            safetyLevelRef.current === 'caution' ? '#F59E0B' : '#EF4444';
        
        userLocationCircleRef.current = L.circle(e.latlng, {
          radius: radius,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.1,
          weight: 2
        }).addTo(map);
        
        addStreetLabels(e.latlng);
        
        if (highPrecisionModeRef.current || !locationTrackingInitializedRef.current) {
          const zoomLevel = radius < 10 ? 19 : 
                          radius < 30 ? 18 : 
                          radius < 100 ? 17 : 16;
          
          map.setView(e.latlng, zoomLevel, { animate: true });
          
          addStreetLabels(e.latlng);
          
          if (locationTrackingInitializedRef.current) {
            highPrecisionModeRef.current = false;
          }
        }
        
        locationTrackingInitializedRef.current = true;
        
        errorCountRef.current = 0;
      } catch (error) {
        console.error("Error creating markers:", error);
        errorCountRef.current++;
      }
      
      if (setUserLocation) {
        setUserLocation([e.latlng.lat, e.latlng.lng]);
      }

      try {
        const customEvent = new CustomEvent('userLocationUpdated', {
          detail: {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            accuracy: radius,
            safetyLevel: safetyLevelRef.current
          }
        });
        document.dispatchEvent(customEvent);
      } catch (error) {
        console.error("Error dispatching location event:", error);
      }
    } catch (error) {
      console.error("Error in handleLocationFound:", error);
      errorCountRef.current++;
      
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

  useEffect(() => {
    const handleHighPrecisionMode = () => {
      highPrecisionModeRef.current = true;
      
      document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
      
      if (userLocationLatLngRef.current) {
        addStreetLabels(userLocationLatLngRef.current);
      }
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    };
  }, [map]);

  const handleLocationError = (e: L.ErrorEvent) => {
    console.error('Location error:', e.message);
    
    if (navigator.geolocation) {
      console.log("Trying fallback geolocation with high accuracy");
      if (watchIdRef.current === null) {
        try {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              if (!map) return;
              
              const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
              const accuracy = position.coords.accuracy;
              
              const locationEvent = {
                latlng,
                accuracy,
                timestamp: position.timestamp,
                bounds: L.latLngBounds(
                  [position.coords.latitude - 0.0001, position.coords.longitude - 0.0001],
                  [position.coords.latitude + 0.0001, position.coords.longitude + 0.0001]
                )
              } as L.LocationEvent;
              
              handleLocationFound(locationEvent);
            },
            (error) => {
              console.error('Geolocation error:', error.message);
              errorCountRef.current++;
            },
            { 
              enableHighAccuracy: true, 
              timeout: 15000, 
              maximumAge: 0
            }
          );
        } catch (error) {
          console.error("Error setting up geolocation watch:", error);
        }
      }
    }
  };

  useEffect(() => {
    try {
      if (!map) return;
      
      map.on('locationfound', handleLocationFound);
      map.on('locationerror', handleLocationError);
      
      if (showUserLocation && !isTracking) {
        console.log("Starting high-precision location tracking");
        
        highPrecisionModeRef.current = true;
        
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        
        if (map.stopLocate) {
          map.stopLocate();
        }
        
        map.locate({ 
          setView: false,
          maxZoom: 19, 
          watch: true,
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Initial high-precision position:", position);
            
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
        
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            if (!map) return;
            
            const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
            const accuracy = position.coords.accuracy;
            
            const locationEvent = {
              latlng,
              accuracy,
              timestamp: position.timestamp,
              bounds: L.latLngBounds(
                [position.coords.latitude - 0.0001, position.coords.longitude - 0.0001],
                [position.coords.latitude + 0.0001, position.coords.longitude + 0.0001]
              )
            } as L.LocationEvent;
            
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
            map.off('locationfound', handleLocationFound);
            map.off('locationerror', handleLocationError);
            
            if (watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
            }
            
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

  useEffect(() => {
    const handleCenterMap = () => {
      if (map && userLocationLatLngRef.current) {
        highPrecisionModeRef.current = true;
        
        map.locate({ 
          setView: false,
          maxZoom: 19, 
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
        
        map.setView(userLocationLatLngRef.current, 18, { animate: true });
        
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
    locationAccuracy: userLocationAccuracyRef.current,
    safetyLevel: safetyLevelRef.current
  };
};

export default useUserLocationTracking;
