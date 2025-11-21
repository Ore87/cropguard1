import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { getWeatherInfo, getDayName } from "@/utils/weather";

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

const fetchWeather = async (): Promise<WeatherData> => {
  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=8.1333&longitude=4.2500&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return response.json();
};

export const WeatherCard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeather,
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
          <CardDescription>Ogbomoso, Nigeria</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
          <CardDescription>Ogbomoso, Nigeria</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <p>Unable to load weather data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const currentWeather = getWeatherInfo(data.current.weather_code);
  const CurrentWeatherIcon = currentWeather.icon;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Weather Forecast</CardTitle>
        <CardDescription>Ogbomoso, Nigeria</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Weather */}
          <div className="flex items-center gap-6 pb-6 border-b border-border">
            <CurrentWeatherIcon className="h-16 w-16 text-primary" />
            <div>
              <p className="text-4xl font-bold text-card-foreground">
                {Math.round(data.current.temperature_2m)}°C
              </p>
              <p className="text-sm text-muted-foreground">{currentWeather.description}</p>
              <p className="text-sm text-muted-foreground">
                Humidity: {data.current.relative_humidity_2m}%
              </p>
            </div>
          </div>

          {/* 3-Day Forecast */}
          <div className="grid grid-cols-3 gap-4">
            {data.daily.time.slice(0, 3).map((date, index) => {
              const dayWeather = getWeatherInfo(data.daily.weather_code[index]);
              const DayWeatherIcon = dayWeather.icon;
              
              return (
                <div
                  key={date}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-accent/50"
                >
                  <p className="text-sm font-medium text-card-foreground">
                    {getDayName(date)}
                  </p>
                  <DayWeatherIcon className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-card-foreground">
                      {Math.round(data.daily.temperature_2m_max[index])}°
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(data.daily.temperature_2m_min[index])}°
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
