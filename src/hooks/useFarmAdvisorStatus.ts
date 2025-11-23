import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { generateRecommendations, SensorData, WeatherData, PestReport, MarketData } from "@/utils/farmAdvisor";

const fetchWeather = async () => {
  const response = await fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=9.0820&longitude=8.6753&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto'
  );
  return response.json();
};

export const useFarmAdvisorStatus = () => {
  const { user, userRole } = useAuth();
  const [farmId, setFarmId] = useState<string | null>(null);

  // Only run for farmers
  const enabled = userRole === "farmer";

  // Fetch farm ID
  useEffect(() => {
    if (!user || !enabled) return;
    const getFarmId = async () => {
      const { data } = await supabase
        .from('farms')
        .select('id')
        .eq('farmer_id', user.id)
        .single();
      
      if (data) setFarmId(data.id);
    };
    getFarmId();
  }, [user, enabled]);

  // Fetch sensor data
  const { data: sensorData } = useQuery({
    queryKey: ['advisor-sensor', farmId],
    queryFn: async () => {
      if (!farmId) return null;
      const { data } = await supabase
        .from('sensor_data')
        .select('temperature, humidity, soil_moisture, light_intensity')
        .eq('farm_id', farmId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      return data as SensorData | null;
    },
    enabled: enabled && !!farmId,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Fetch weather data
  const { data: weatherData } = useQuery<WeatherData>({
    queryKey: ['advisor-weather'],
    queryFn: fetchWeather,
    enabled,
    refetchInterval: 15 * 60 * 1000,
  });

  // Fetch latest pest report
  const { data: pestReport } = useQuery({
    queryKey: ['advisor-pest-report', farmId],
    queryFn: async () => {
      if (!farmId) return null;
      const { data } = await supabase
        .from('analysis_reports')
        .select('infestation_level, confidence_score, analyzed_at')
        .eq('farm_id', farmId)
        .order('analyzed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      return data as PestReport | null;
    },
    enabled: enabled && !!farmId,
    refetchInterval: 5 * 60 * 1000,
  });

  // Fetch market data
  const { data: marketData } = useQuery({
    queryKey: ['advisor-market-data'],
    queryFn: async () => {
      const { data } = await supabase
        .from('market_price_submissions')
        .select('crop_name, price_per_kg, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      return (data || []) as MarketData[];
    },
    enabled,
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  });

  // Generate recommendations and count urgent ones
  const recommendations = enabled ? generateRecommendations(
    sensorData || null,
    weatherData || null,
    pestReport || null,
    marketData || []
  ) : [];

  const urgentCount = recommendations.filter(
    rec => rec.urgency === 'critical' || rec.urgency === 'warning'
  ).length;

  return {
    hasUrgentRecommendations: urgentCount > 0,
    urgentCount,
  };
};
