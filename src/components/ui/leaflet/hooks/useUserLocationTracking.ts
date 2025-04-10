useEffect(() => {
  if (!map) {
    console.log("Map not available for location tracking");
    return;
  }

  try {
    if (!map.getContainer() || !document.body.contains(map.getContainer())) {
      console.log("Map container not in DOM");
      return;
    }
  } catch (error) {
    console.error("Error checking map container:", error);
    return;
  }

  if (showUserLocation) {
    console.log("Starting location tracking");
    startHighAccuracyWatch();
  } else {
    console.log("Stopping location tracking");
    cleanupMarkers();
    stopWatch();
  }

  // Always set tracking state based on prop — no conditions
  setIsTracking(showUserLocation);

  return () => {
    stopWatch();
    cleanupMarkers();
    setIsTracking(false); // Reset on unmount
  };
}, [map, showUserLocation, cleanupMarkers, startHighAccuracyWatch, stopWatch]);
