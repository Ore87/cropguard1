import { Sun, Cloud, CloudRain, CloudSnow, CloudDrizzle, CloudFog, Zap } from "lucide-react";

export interface WeatherCodeMapping {
  icon: any;
  description: string;
}

export const getWeatherInfo = (code: number): WeatherCodeMapping => {
  const weatherCodes: Record<number, WeatherCodeMapping> = {
    0: { icon: Sun, description: "Clear Sky" },
    1: { icon: Sun, description: "Mainly Clear" },
    2: { icon: Cloud, description: "Partly Cloudy" },
    3: { icon: Cloud, description: "Overcast" },
    45: { icon: CloudFog, description: "Foggy" },
    48: { icon: CloudFog, description: "Depositing Rime Fog" },
    51: { icon: CloudDrizzle, description: "Light Drizzle" },
    53: { icon: CloudDrizzle, description: "Moderate Drizzle" },
    55: { icon: CloudDrizzle, description: "Dense Drizzle" },
    61: { icon: CloudRain, description: "Slight Rain" },
    63: { icon: CloudRain, description: "Moderate Rain" },
    65: { icon: CloudRain, description: "Heavy Rain" },
    71: { icon: CloudSnow, description: "Slight Snow" },
    73: { icon: CloudSnow, description: "Moderate Snow" },
    75: { icon: CloudSnow, description: "Heavy Snow" },
    80: { icon: CloudRain, description: "Slight Rain Showers" },
    81: { icon: CloudRain, description: "Moderate Rain Showers" },
    82: { icon: CloudRain, description: "Violent Rain Showers" },
    95: { icon: Zap, description: "Thunderstorm" },
    96: { icon: Zap, description: "Thunderstorm with Slight Hail" },
    99: { icon: Zap, description: "Thunderstorm with Heavy Hail" },
  };

  return weatherCodes[code] || { icon: Cloud, description: "Unknown" };
};

export const getDayName = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
};
