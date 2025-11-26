import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, AlertTriangle, AlertCircle, CheckCircle, Info } from "lucide-react";
import { generateRecommendations, SensorData, WeatherData, PestReport, MarketData, Recommendation } from "@/utils/farmAdvisor";

const fetchWeather = async () => {
  const response = await fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=9.0820&longitude=8.6753&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto'
  );
  return response.json();
};

const FarmAdvisor = () => {
  const { user } = useAuth();
  const [farmId, setFarmId] = useState<string | null>(null);

  // Fetch farm ID
  useEffect(() => {
    const getFarmId = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('farms')
        .select('id')
        .eq('farmer_id', user.id)
        .single();
      
      if (data) setFarmId(data.id);
    };
    getFarmId();
  }, [user]);

  // Fetch sensor data
  const { data: sensorData } = useQuery({
    queryKey: ['latest-sensor', farmId],
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
    enabled: !!farmId,
  });

  // Fetch weather data
  const { data: weatherData } = useQuery<WeatherData>({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });

  // Fetch latest pest report
  const { data: pestReport } = useQuery({
    queryKey: ['latest-pest-report', farmId],
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
    enabled: !!farmId,
  });

  // Fetch market data
  const { data: marketData } = useQuery({
    queryKey: ['market-data'],
    queryFn: async () => {
      const { data } = await supabase
        .from('market_price_submissions')
        .select('crop_name, price_per_kg, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      return (data || []) as MarketData[];
    },
  });

  const recommendations = generateRecommendations(
    sensorData || null,
    weatherData || null,
    pestReport || null,
    marketData || []
  );

  const getUrgencyStyles = (urgency: Recommendation['urgency']) => {
    switch (urgency) {
      case 'critical':
        return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'warning':
        return 'border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'advice':
        return 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const getUrgencyIcon = (urgency: Recommendation['urgency']) => {
    switch (urgency) {
      case 'critical':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case 'advice':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const isLoading = !sensorData && !weatherData && !pestReport && !marketData;

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Integrated Farm Insights</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            AI-powered recommendations based on your sensor data, weather forecasts, pest reports, and market trends
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Analyzing farm data...</span>
          </div>
        ) : (
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className={getUrgencyStyles(rec.urgency)}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {getUrgencyIcon(rec.urgency)}
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{rec.title}</CardTitle>
                      <p className="text-sm text-muted-foreground font-medium">
                        {rec.category}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p 
                    className="text-base leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: rec.message }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 p-6 border border-border rounded-lg bg-muted/30">
          <h3 className="font-semibold text-lg mb-3">Data Sources Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Sensor Data</p>
              <p className="font-medium">{sensorData ? '✓ Available' : '✗ No data'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Weather Forecast</p>
              <p className="font-medium">{weatherData ? '✓ Available' : '✗ No data'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pest Reports</p>
              <p className="font-medium">{pestReport ? '✓ Available' : '✗ No data'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Market Data</p>
              <p className="font-medium">{marketData && marketData.length > 0 ? `✓ ${marketData.length} entries` : '✗ No data'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FarmAdvisor;
