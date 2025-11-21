import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Droplets, Thermometer, Wind, Sun, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    soilMoisture: 0,
    temperature: 0,
    humidity: 0,
    lightIntensity: 0,
    criticalAlerts: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const { data: farms } = await supabase
        .from("farms")
        .select("id")
        .eq("farmer_id", user.id)
        .limit(1)
        .single();

      if (!farms) return;

      const { data: sensorData } = await supabase
        .from("sensor_data")
        .select("*")
        .eq("farm_id", farms.id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();

      const { data: alerts, count } = await supabase
        .from("alerts")
        .select("*", { count: "exact" })
        .eq("farm_id", farms.id)
        .eq("severity", "critical")
        .eq("is_read", false);

      if (sensorData) {
        setStats({
          soilMoisture: sensorData.soil_moisture || 0,
          temperature: sensorData.temperature || 0,
          humidity: sensorData.humidity || 0,
          lightIntensity: sensorData.light_intensity || 0,
          criticalAlerts: count || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="mb-6 text-3xl font-bold text-foreground">Dashboard Overview</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <StatCard
            title="Critical Alerts"
            value={stats.criticalAlerts.toString()}
            icon={<AlertTriangle className="h-8 w-8 text-alert" />}
            description="Unread critical alerts"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/sensors" className="block rounded-lg border border-border p-4 hover:bg-accent transition-colors">
                <h3 className="font-semibold text-card-foreground">View Sensor Data</h3>
                <p className="text-sm text-muted-foreground">Monitor real-time IoT metrics</p>
              </a>
              <a href="/upload" className="block rounded-lg border border-border p-4 hover:bg-accent transition-colors">
                <h3 className="font-semibold text-card-foreground">Upload Image</h3>
                <p className="text-sm text-muted-foreground">Scan for pests with AI</p>
              </a>
              <a href="/alerts" className="block rounded-lg border border-border p-4 hover:bg-accent transition-colors">
                <h3 className="font-semibold text-card-foreground">View Alerts</h3>
                <p className="text-sm text-muted-foreground">Check notifications</p>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Platform health indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">IoT Sensors</span>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AI Detection</span>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Sync</span>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Synced</span>
              </div>
            </CardContent>
          </Card>
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