
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { weatherService, WeatherData } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';

interface WeatherForecastCardProps {
  userLocation: [number, number] | null;
  countryCode?: string;
}

const WeatherForecastCard = ({ userLocation, countryCode }: WeatherForecastCardProps) => {
  const { toast } = useToast();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!userLocation) return;
      
      setLoading(true);
      try {
        const locationStr = `${userLocation[0]},${userLocation[1]}`;
        const data = await weatherService.getForecastWeather(locationStr, 3);
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather forecast:', error);
        toast({
          title: 'Weather Error',
          description: 'Unable to fetch weather forecast. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      fetchWeatherData();
    }
  }, [userLocation, toast]);

  const handleRefresh = async () => {
    if (!userLocation) {
      toast({
        title: 'Location Required',
        description: 'Your location is needed to fetch the weather forecast.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const locationStr = `${userLocation[0]},${userLocation[1]}`;
      const data = await weatherService.getForecastWeather(locationStr, 3);
      setWeatherData(data);
      toast({
        title: 'Weather Updated',
        description: 'Weather forecast has been refreshed.',
      });
    } catch (error) {
      console.error('Error refreshing weather forecast:', error);
      toast({
        title: 'Weather Error',
        description: 'Failed to refresh weather forecast.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get weather icon
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
      return <CloudRain className="h-5 w-5 text-blue-500" />;
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return <Cloud className="h-5 w-5 text-gray-500" />;
    }
    return <Sun className="h-5 w-5 text-yellow-500" />;
  };

  if (!userLocation) {
    return null;
  }

  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Cloud className="h-4 w-4 text-blue-500" />
          Weather Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="ml-2 text-sm">Loading forecast...</span>
          </div>
        ) : weatherData ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium">{weatherData.location.name}</p>
                <p className="text-sm text-muted-foreground">{weatherData.location.region}, {weatherData.location.country}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span className="text-lg font-medium">{weatherData.current.temp_c}°C</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Feels like {weatherData.current.feelslike_c}°C
                </p>
              </div>
            </div>
            
            <div className="border-t border-b border-blue-100 dark:border-blue-800 py-2 my-2">
              <p className="text-sm font-medium mb-1">Current Conditions</p>
              <div className="flex items-center gap-2">
                {getWeatherIcon(weatherData.current.condition.text)}
                <span>{weatherData.current.condition.text}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Humidity: {weatherData.current.humidity}% | Wind: {weatherData.current.wind_kph} km/h
              </div>
            </div>
            
            {weatherData.forecast?.forecastday && (
              <div>
                <p className="text-sm font-medium mb-2">3-Day Forecast</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {weatherData.forecast.forecastday.map((day, index) => (
                    <div key={`day-${index}`} className="border border-blue-100 dark:border-blue-800 rounded p-2">
                      <p className="text-xs font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <div className="my-1">
                        {getWeatherIcon(day.day.condition.text)}
                      </div>
                      <p className="text-xs">
                        {day.day.maxtemp_c}° / {day.day.mintemp_c}°
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2 text-xs" 
              onClick={handleRefresh}
            >
              Refresh Forecast
            </Button>
          </div>
        ) : (
          <div className="text-center py-3 text-sm text-muted-foreground">
            <Cloud className="h-5 w-5 mx-auto mb-2 opacity-50" />
            <p>Weather data unavailable</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-xs" 
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherForecastCard;
