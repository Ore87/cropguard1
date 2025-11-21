import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { getWeatherInfo, getDayName } from "@/utils/weather";
import { useState, useEffect } from "react";
import { format } from "date-fns";

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

const Weather = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeather,
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="mb-6 text-3xl font-bold text-foreground">Weather Forecast</h1>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="mb-6 text-3xl font-bold text-foreground">Weather Forecast</h1>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-16 w-16" />
              <p className="text-lg">Unable to load weather data</p>
              <p className="text-sm">Please check your connection and try again</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  const currentWeather = getWeatherInfo(data.current.weather_code);
  const CurrentWeatherIcon = currentWeather.icon;

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Weather Forecast</h1>
          <p className="text-muted-foreground">Ogbomoso, Nigeria</p>
          <p className="text-sm text-muted-foreground mt-1">
            {format(currentTime, "EEEE, MMMM d, h:mm a")}
          </p>
        </div>

        {/* Current Weather - Large Display */}
        <Card className="mb-8">
          <CardContent className="p-12">
            <div className="flex flex-col items-center gap-6">
              <CurrentWeatherIcon className="h-32 w-32 text-primary" />
              <div className="text-center">
                <p className="text-7xl font-bold text-card-foreground mb-4">
                  {Math.round(data.current.temperature_2m)}°C
                </p>
                <p className="text-2xl text-muted-foreground mb-2">
                  {currentWeather.description}
                </p>
                <p className="text-lg text-muted-foreground">
                  Humidity: {data.current.relative_humidity_2m}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3-Day Forecast - Expanded View */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-foreground">3-Day Forecast</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {data.daily.time.slice(0, 3).map((date, index) => {
              const dayWeather = getWeatherInfo(data.daily.weather_code[index]);
              const DayWeatherIcon = dayWeather.icon;
              
              return (
                <Card key={date}>
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-xl font-semibold text-card-foreground">
                        {getDayName(date)}
                      </p>
                      <DayWeatherIcon className="h-16 w-16 text-primary" />
                      <p className="text-lg text-muted-foreground text-center">
                        {dayWeather.description}
                      </p>
                      <div className="text-center space-y-1">
                        <p className="text-3xl font-bold text-card-foreground">
                          {Math.round(data.daily.temperature_2m_max[index])}°
                        </p>
                        <p className="text-lg text-muted-foreground">
                          Low: {Math.round(data.daily.temperature_2m_min[index])}°
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Weather;
