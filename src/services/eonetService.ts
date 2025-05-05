
/**
 * NASA EONET (Earth Observatory Natural Event Tracker) Service
 * For more information: https://eonet.gsfc.nasa.gov/docs/v3
 */

export interface EonetEvent {
  id: string;
  title: string;
  description: string;
  categories: string[];
  geometry: {
    date: string;
    type: string;
    coordinates: number[];
  }[];
  sources: {
    id: string;
    url: string;
  }[];
}

/**
 * Fetches active natural events from NASA's EONET API
 * @returns Array of parsed natural disaster events
 */
export async function fetchActiveNaturalEvents(): Promise<EonetEvent[]> {
  const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open';

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    return data.events.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description || 'No description available',
      categories: event.categories.map((c: any) => c.title),
      geometry: event.geometry,
      sources: event.sources || []
    }));
  } catch (error) {
    console.error('Failed to fetch EONET events:', error);
    return [];
  }
}

/**
 * Transforms EONET events to DisasterAlert format
 */
export function transformEonetToDisasterAlerts(events: EonetEvent[]): import('@/types/disasters').DisasterAlert[] {
  return events.map(event => {
    // Get the first geometry item for coordinates
    const geometry = event.geometry[0];
    const coordinates = geometry?.coordinates || [0, 0];
    
    // Map EONET category to our disaster types
    let type = mapEonetCategoryToDisasterType(event.categories[0] || '');
    
    // Map severity based on category and description
    const severity = determineSeverity(event.title, event.description);
    
    return {
      id: `eonet-${event.id}`,
      title: event.title,
      type,
      severity,
      location: extractLocationFromTitle(event.title),
      coordinates: [coordinates[1], coordinates[0]], // EONET uses [lng, lat], we use [lat, lng]
      description: event.description,
      date: geometry?.date || new Date().toISOString(),
      source: 'NASA EONET',
      active: true,
      country: extractCountryFromTitle(event.title),
      region: extractRegionFromTitle(event.title),
      url: event.sources?.length > 0 ? event.sources[0].url : undefined
    };
  });
}

// Helper functions for data transformation
function mapEonetCategoryToDisasterType(category: string): import('@/types/disasters').DisasterAlertType {
  const categoryMap: Record<string, import('@/types/disasters').DisasterAlertType> = {
    'Wildfires': 'wildfire',
    'Severe Storms': 'storm',
    'Volcanoes': 'earthquake',
    'Sea and Lake Ice': 'flood',
    'Floods': 'flood',
    'Drought': 'extreme_heat',
    'Earthquakes': 'earthquake',
    'Landslides': 'flood',
    'Temperature Extremes': 'extreme_heat'
  };
  
  return categoryMap[category] || 'storm';
}

function determineSeverity(title: string, description: string): import('@/types/disasters').DisasterAlertSeverity {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('extreme') || text.includes('major') || 
      text.includes('severe') || text.includes('warning')) {
    return 'warning';
  }
  
  if (text.includes('moderate') || text.includes('watch') || 
      text.includes('potential')) {
    return 'watch';
  }
  
  return 'advisory';
}

function extractLocationFromTitle(title: string): string {
  // Many EONET titles have the format "Event Type, Location"
  const parts = title.split(', ');
  
  if (parts.length > 1) {
    return parts.slice(1).join(', ');
  }
  
  return title;
}

function extractCountryFromTitle(title: string): string {
  const location = extractLocationFromTitle(title);
  // Look for common country names in the title
  const countries = [
    'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina',
    'UK', 'France', 'Germany', 'Italy', 'Spain',
    'China', 'Japan', 'India', 'Russia', 'Australia'
  ];
  
  for (const country of countries) {
    if (location.includes(country)) {
      return country;
    }
  }
  
  return 'International';
}

function extractRegionFromTitle(title: string): string {
  const location = extractLocationFromTitle(title);
  // Try to extract region from location
  const parts = location.split(', ');
  
  if (parts.length > 1) {
    return parts[0];
  }
  
  return location;
}
