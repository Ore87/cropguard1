import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { generateRecommendations, SensorData, WeatherData, PestReport, MarketData } from "@/utils/farmAdvisor";

// Helper to check if user has contacted agronomist after the latest critical pest alert
const checkAgronomistContact = async (userId: string, farmId: string, pestReportDate: string) => {
  const { data } = await supabase
    .from('agronomist_contacts')
    .select('contacted_at')
    .eq('user_id', userId)
    .eq('farm_id', farmId)
    .gte('contacted_at', pestReportDate)
    .limit(1)
    .maybeSingle();
  
  return !!data;
};

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

  // Check if user has contacted agronomist for critical pest issues
  const [hasContactedAgronomist, setHasContactedAgronomist] = useState(false);

  useEffect(() => {
    const checkContact = async () => {
      if (!user || !farmId || !pestReport || !enabled) return;
      
      // Only check if there's a critical pest issue
      const hasCriticalPest = recommendations.some(
        r => r.urgency === 'critical' && r.id === 'critical-pest'
      );
      
      if (hasCriticalPest) {
        const contacted = await checkAgronomistContact(
          user.id, 
          farmId, 
          pestReport.analyzed_at
        );
        setHasContactedAgronomist(contacted);
      } else {
        setHasContactedAgronomist(false);
      }
    };
    
    checkContact();
  }, [user, farmId, pestReport, recommendations, enabled]);

  const criticalRecommendations = recommendations.filter(r => r.urgency === 'critical');
  
  // Only show notification badge if there are critical issues AND user hasn't contacted agronomist
  const shouldShowNotification = criticalRecommendations.length > 0 && !hasContactedAgronomist;

  return {
    hasUrgentRecommendations: shouldShowNotification,
    urgentCount: shouldShowNotification ? criticalRecommendations.length : 0,
  };
};
