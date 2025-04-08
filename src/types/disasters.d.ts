
export interface DisasterAlert {
  id: string;
  title: string;
  type: 'earthquake' | 'flood' | 'fire' | 'hurricane' | 'tornado' | 'other';
  severity: 'low' | 'medium' | 'high';
  location: string;
  coordinates?: [number, number];
  description: string;
  date: string;
  source: string;
  active: boolean;
}

export interface WeatherAlert {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  description: string;
  date: string;
  source: string;
  expires?: string;
  active: boolean;
}
