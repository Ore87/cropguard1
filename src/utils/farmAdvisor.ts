export interface SensorData {
  temperature: number | null;
  humidity: number | null;
  soil_moisture: number | null;
  light_intensity: number | null;
}

export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    weather_code: number[];
  };
}

export interface PestReport {
  infestation_level: string | null;
  confidence_score: number | null;
  analyzed_at: string;
}

export interface MarketData {
  crop_name: string;
  price_per_kg: number;
  created_at: string;
}

export interface Recommendation {
  id: string;
  title: string;
  message: string;
  urgency: 'critical' | 'warning' | 'advice' | 'normal';
  category: string;
}

const isRainInForecast = (weatherData: WeatherData | null): boolean => {
  if (!weatherData?.daily) return false;
  
  // Weather codes for rain: 51, 53, 55, 61, 63, 65, 80, 81, 82
  const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82];
  
  // Check next 24 hours (first day in forecast)
  return rainCodes.includes(weatherData.daily.weather_code[0]);
};

const getHighestTempTomorrow = (weatherData: WeatherData | null): number | null => {
  if (!weatherData?.daily?.temperature_2m_max) return null;
  return weatherData.daily.temperature_2m_max[1] || weatherData.daily.temperature_2m_max[0];
};

const isMarketTrendingUp = (marketData: MarketData[], cropName: string): boolean => {
  const cropData = marketData.filter(d => d.crop_name.toLowerCase() === cropName.toLowerCase());
  if (cropData.length < 2) return false;
  
  // Compare most recent price to average of previous prices
  const sorted = [...cropData].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  const latest = sorted[0].price_per_kg;
  const previousAvg = sorted.slice(1, 5).reduce((sum, d) => sum + d.price_per_kg, 0) / Math.min(4, sorted.length - 1);
  
  return latest > previousAvg * 1.1; // 10% increase
};

export const generateRecommendations = (
  sensorData: SensorData | null,
  weatherData: WeatherData | null,
  pestReport: PestReport | null,
  marketData: MarketData[]
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Scenario A: Pest + Weather (Timing Action)
  if (
    pestReport && 
    (pestReport.infestation_level === 'medium' || pestReport.infestation_level === 'high') &&
    isRainInForecast(weatherData)
  ) {
    recommendations.push({
      id: 'pest-weather-rain',
      title: '🚫 Delay Pesticide Application',
      message: 'DO NOT spray pesticides today. Upcoming rain will wash treatments away. Wait for a clear dry window to maximize treatment effectiveness.',
      urgency: 'warning',
      category: 'Pest & Weather'
    });
  }
  
  // Scenario B: Sensor + Weather (Water Management)
  const soilMoisture = sensorData?.soil_moisture;
  const tomorrowTemp = getHighestTempTomorrow(weatherData);
  
  if (
    soilMoisture !== null && 
    soilMoisture !== undefined && 
    soilMoisture < 30 && 
    tomorrowTemp !== null && 
    tomorrowTemp > 35
  ) {
    recommendations.push({
      id: 'sensor-weather-irrigation',
      title: '💧 CRITICAL: Immediate Irrigation Required',
      message: `Severe heat stress is likely tomorrow due to dry soil (${soilMoisture.toFixed(1)}%) and high forecasted temperatures (${tomorrowTemp.toFixed(1)}°C). Irrigate immediately to prevent crop damage.`,
      urgency: 'critical',
      category: 'Water Management'
    });
  }
  
  // Additional water management warning
  if (soilMoisture !== null && soilMoisture !== undefined && soilMoisture < 25) {
    recommendations.push({
      id: 'low-soil-moisture',
      title: '⚠️ Low Soil Moisture Detected',
      message: `Soil moisture is critically low at ${soilMoisture.toFixed(1)}%. Plan irrigation to prevent crop stress.`,
      urgency: 'warning',
      category: 'Water Management'
    });
  }
  
  // Scenario C: Market + General Health (Profit Opportunity)
  if (
    pestReport &&
    (pestReport.infestation_level === 'none' || pestReport.infestation_level === 'low') &&
    (isMarketTrendingUp(marketData, 'Maize') || isMarketTrendingUp(marketData, 'Corn'))
  ) {
    recommendations.push({
      id: 'market-health-opportunity',
      title: '📈 Profit Opportunity Detected',
      message: 'Crop health is good and Maize prices are rising. Consider preparing for harvest soon to maximize profit. Market conditions are favorable.',
      urgency: 'advice',
      category: 'Market Opportunity'
    });
  }
  
  // Additional pest warning
  if (pestReport && pestReport.infestation_level === 'critical') {
    recommendations.push({
      id: 'critical-pest',
      title: '🐛 URGENT: Critical Pest Infestation',
      message: 'Critical pest levels detected. Immediate intervention required. Consult with an agronomist for treatment recommendations.',
      urgency: 'critical',
      category: 'Pest Management'
    });
  }
  
  // Temperature stress warning
  if (weatherData?.current?.temperature_2m && weatherData.current.temperature_2m > 38) {
    recommendations.push({
      id: 'extreme-heat',
      title: '🌡️ Extreme Heat Alert',
      message: `Current temperature is ${weatherData.current.temperature_2m.toFixed(1)}°C. Monitor crops closely for heat stress. Ensure adequate irrigation.`,
      urgency: 'warning',
      category: 'Climate Stress'
    });
  }
  
  // Optimal conditions
  if (
    sensorData?.soil_moisture && sensorData.soil_moisture >= 50 && sensorData.soil_moisture <= 70 &&
    pestReport && pestReport.infestation_level === 'none' &&
    weatherData?.current?.temperature_2m && weatherData.current.temperature_2m >= 20 && weatherData.current.temperature_2m <= 30
  ) {
    recommendations.push({
      id: 'optimal-conditions',
      title: '✅ Optimal Growing Conditions',
      message: 'All systems are operating within ideal ranges. Soil moisture is balanced, no pests detected, and temperature is optimal for crop growth.',
      urgency: 'advice',
      category: 'Status'
    });
  }
  
  // Default recommendation if no specific rules triggered
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'normal-operation',
      title: '✓ System Operating Normally',
      message: 'Continue regular monitoring. All parameters are within acceptable ranges. No immediate actions required.',
      urgency: 'normal',
      category: 'Status'
    });
  }
  
  return recommendations;
};
