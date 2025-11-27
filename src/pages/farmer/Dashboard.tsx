import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Droplets, Thermometer, Wind, Sun, AlertTriangle, CloudRain, Bug, TrendingUp, Lightbulb, ArrowRight, Camera } from "lucide-react";
import { getWeatherInfo } from "@/utils/weather";
import { generateRecommendations } from "@/utils/farmAdvisor";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";

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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [farmId, setFarmId] = useState<string | null>(null);

  // Fetch farm ID
  useEffect(() => {
    const fetchFarm = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("farms")
        .select("id")
        .eq("farmer_id", user.id)
        .maybeSingle();
      
      if (data) setFarmId(data.id);
    };
    fetchFarm();
  }, [user]);

  // Fetch sensor data
  const { data: sensorData } = useQuery({
    queryKey: ["dashboard-sensor", farmId],
    queryFn: async () => {
      if (!farmId) return null;
      const { data } = await supabase
        .from("sensor_data")
        .select("*")
        .eq("farm_id", farmId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!farmId,
  });

  // Fetch critical alerts count
  const { data: alertsCount = 0 } = useQuery({
    queryKey: ["dashboard-alerts", farmId],
    queryFn: async () => {
      if (!farmId) return 0;
      const { count } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("farm_id", farmId)
        .eq("severity", "critical")
        .eq("is_read", false);
      return count || 0;
    },
    enabled: !!farmId,
  });

  // Fetch weather data
  const { data: weatherData } = useQuery({
    queryKey: ["dashboard-weather"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=8.1227&longitude=4.2436&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Africa%2FLagos&forecast_days=3"
      );
      return response.json() as Promise<WeatherData>;
    },
  });

  // Fetch latest pest detection
  const { data: latestScan } = useQuery({
    queryKey: ["dashboard-latest-scan", farmId],
    queryFn: async () => {
      if (!farmId) return null;
      const { data } = await supabase
        .from("analysis_reports")
        .select("*")
        .eq("farm_id", farmId)
        .order("analyzed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!farmId,
  });

  // Fetch recent analysis reports (last 3)
  const { data: recentReports = [] } = useQuery({
    queryKey: ["dashboard-recent-reports", farmId],
    queryFn: async () => {
      if (!farmId) return [];
      const { data } = await supabase
        .from("analysis_reports")
        .select("*")
        .eq("farm_id", farmId)
        .order("analyzed_at", { ascending: false })
        .limit(3);
      return data || [];
    },
    enabled: !!farmId,
  });

  // Fetch market data for Maize
  const { data: maizePrice } = useQuery({
    queryKey: ["dashboard-market-maize"],
    queryFn: async () => {
      const twoDaysAgo = subDays(new Date(), 2);
      const { data } = await supabase
        .from("market_price_submissions")
        .select("*")
        .eq("crop_name", "Maize")
        .gte("created_at", twoDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(2);
      
      if (!data || data.length === 0) return null;
      
      const latest = data[0];
      let trend = "→";
      let trendPercent = 0;
      
      if (data.length > 1) {
        const previous = data[1];
        const change = ((latest.price_per_kg - previous.price_per_kg) / previous.price_per_kg) * 100;
        trendPercent = Math.abs(change);
        trend = change > 0 ? "↗️" : change < 0 ? "↘️" : "→";
      }
      
      return { price: latest.price_per_kg, trend, trendPercent };
    },
  });

  // Generate recommendations count
  const { data: recommendationsData } = useQuery({
    queryKey: ["dashboard-recommendations", farmId, sensorData, weatherData, latestScan],
    queryFn: async () => {
      if (!farmId) return { total: 0, urgent: null };
      
      const pestReport = latestScan ? {
        infestation_level: latestScan.infestation_level || "low",
        confidence_score: latestScan.confidence_score || 0,
        analyzed_at: latestScan.analyzed_at
      } : null;
      
      const recommendations = generateRecommendations(
        sensorData || null,
        weatherData || null,
        pestReport,
        []
      );
      
      const urgent = recommendations.find(r => r.urgency === "critical");
      return { total: recommendations.length, urgent };
    },
    enabled: !!farmId,
  });

  const stats = {
    soilMoisture: sensorData?.soil_moisture || 0,
    temperature: sensorData?.temperature || 0,
    humidity: sensorData?.humidity || 0,
    lightIntensity: sensorData?.light_intensity || 0,
    criticalAlerts: alertsCount,
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="mb-6 text-3xl font-bold text-foreground">Dashboard Overview</h1>
        
        {/* Section 1: Real-Time Field Status */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Real-Time Field Status</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Soil Moisture"
              value={`${stats.soilMoisture.toFixed(1)}%`}
              icon={<Droplets className="h-8 w-8 text-primary" />}
              description="Current soil moisture level"
            />
            <StatCard
              title="Temperature"
              value={`${stats.temperature.toFixed(1)}°C`}
              icon={<Thermometer className="h-8 w-8 text-primary" />}
              description="Current air temperature"
            />
            <StatCard
              title="Humidity"
              value={`${stats.humidity.toFixed(1)}%`}
              icon={<Wind className="h-8 w-8 text-primary" />}
              description="Current humidity level"
            />
            <StatCard
              title="Light Intensity"
              value={`${stats.lightIntensity.toFixed(0)} lux`}
              icon={<Sun className="h-8 w-8 text-primary" />}
              description="Current light intensity"
            />
          </div>
        </div>

        {/* Section 2: Key Insights & Actions */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Key Insights & Actions</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Weather Snapshot Card */}
            <Card 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => navigate("/weather")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CloudRain className="h-4 w-4" />
                  Weather Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weatherData ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      {(() => {
                        const WeatherIcon = getWeatherInfo(weatherData.current.weather_code).icon;
                        return <WeatherIcon className="h-8 w-8 text-primary" />;
                      })()}
                      <div className="text-3xl font-bold text-card-foreground">
                        {weatherData.current.temperature_2m.toFixed(0)}°C
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getWeatherInfo(weatherData.current.weather_code).description}.
                      {weatherData.daily.weather_code[1] && 
                        ` ${getWeatherInfo(weatherData.daily.weather_code[1]).description} tomorrow.`
                      }
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading weather...</p>
                )}
              </CardContent>
            </Card>

            {/* Pest Detection Status Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Pest Detection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestScan ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Scan:</p>
                      <p className="text-sm font-semibold text-card-foreground">
                        {format(new Date(latestScan.analyzed_at), "MMM d, h:mm a")}
                      </p>
                      <Badge 
                        variant={
                          latestScan.infestation_level === "critical" ? "destructive" :
                          latestScan.infestation_level === "high" ? "destructive" :
                          latestScan.infestation_level === "medium" ? "default" : "secondary"
                        }
                        className="mt-1"
                      >
                        {latestScan.infestation_level?.toUpperCase() || "UNKNOWN"} Infestation
                      </Badge>
                    </div>
                    <div className="flex gap-2 w-full">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate("/upload?type=spot_check")}>
                        Spot Check
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate("/upload?type=drone_flight")}>
                        Drone Flight
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">No scans yet</p>
                    <Button size="sm" onClick={() => navigate("/upload")}>
                      <Camera className="h-4 w-4 mr-2" />
                      Start First Scan
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Farm Advisor Insights Card */}
            <Card 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => navigate("/farm-advisor")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Farm Advisor Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendationsData ? (
                  <>
                    <div className="text-3xl font-bold text-card-foreground mb-2">
                      {recommendationsData.total} Active
                    </div>
                    {recommendationsData.urgent && (
                      <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2">
                        <p className="text-xs font-semibold text-destructive mb-1">URGENT</p>
                        <p className="text-xs text-foreground line-clamp-2">
                          {recommendationsData.urgent.title}
                        </p>
                      </div>
                    )}
                    {!recommendationsData.urgent && (
                      <p className="text-xs text-muted-foreground">
                        {recommendationsData.total > 0 
                          ? "Click to view all recommendations" 
                          : "All systems operating normally"}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading insights...</p>
                )}
              </CardContent>
            </Card>

            {/* Market Watch Card */}
            <Card 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => navigate("/market-trends")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Market Watch
                </CardTitle>
              </CardHeader>
              <CardContent>
                {maizePrice ? (
                  <>
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground">Maize Price</p>
                      <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-bold text-card-foreground">
                          ₦{maizePrice.price.toFixed(0)}
                        </div>
                        <span className="text-sm text-muted-foreground">/kg</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{maizePrice.trend}</span>
                      <span className="text-xs text-muted-foreground">
                        {maizePrice.trendPercent > 0 
                          ? `${maizePrice.trendPercent.toFixed(1)}% today`
                          : "No change"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent market data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 3: Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/analysis")}>
              View All Reports
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {recentReports.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => navigate(`/report/${report.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                          <img
                            src={report.image_url}
                            alt="Scan thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {report.scan_type === "spot_check" ? "Spot Check" : "Drone Flight"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(report.analyzed_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          report.infestation_level === "critical" ? "destructive" :
                          report.infestation_level === "high" ? "destructive" :
                          report.infestation_level === "medium" ? "default" : "secondary"
                        }
                      >
                        {report.infestation_level?.toUpperCase() || "UNKNOWN"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No Activity Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                  Start monitoring your farm by uploading images for AI analysis
                </p>
                <Button onClick={() => navigate("/upload")}>
                  Upload First Image
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon, description }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-card-foreground">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default Dashboard;