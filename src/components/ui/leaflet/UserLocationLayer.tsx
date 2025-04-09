
import { useState } from 'react';
import LocationMarker from './user-location/LocationMarker';
import CenterMapHandler from './user-location/CenterMapHandler';

interface UserLocationLayerProps {
  map: L.Map | null;
  userLocation: [number, number] | null;
  accuracy: number;
  safetyLevel: 'safe' | 'caution' | 'danger';
}

/**
 * Component that manages all aspects of displaying the user's location on the map
 */
const UserLocationLayer = ({
  map,
  userLocation,
  accuracy,
  safetyLevel
}: UserLocationLayerProps) => {
  const [error, setError] = useState<string | null>(null);
  
  return (
    <>
      {/* Manages the user location marker and accuracy circle */}
      <LocationMarker 
        map={map}
        userLocation={userLocation}
        accuracy={accuracy}
        safetyLevel={safetyLevel}
      />
      
      {/* Handles center map on user location events */}
      <CenterMapHandler 
        map={map}
        userLocation={userLocation}
      />
    </>
  );
};

export default UserLocationLayer;
