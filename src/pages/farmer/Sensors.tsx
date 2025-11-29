import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SensorReading {
  recorded_at: string;
  soil_moisture: number;
  temperature: number;
  humidity: number;
  light_intensity: number;
}

const Sensors = () => {
  const { user } = useAuth();
  const [farmId, setFarmId] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [currentValues, setCurrentValues] = useState({
    soil_moisture: 0,
    temperature: 0,
    humidity: 0,
    light_intensity: 0,
  });

  useEffect(() => {
    fetchFarmAndData();
  }, [user]);

  useEffect(() => {
    if (!farmId) return;

    // Subscribe to real-time sensor data updates
    const channel = supabase
      .channel('sensor-data-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_data',
          filter: `farm_id=eq.${farmId}`
        },
        (payload) => {
          const newReading = payload.new as SensorReading;
          setSensorData(prev => [...prev.slice(-19), newReading]);
          setCurrentValues({
            soil_moisture: newReading.soil_moisture || 0,
            temperature: newReading.temperature || 0,
            humidity: newReading.humidity || 0,
            light_intensity: newReading.light_intensity || 0,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmId]);

  const fetchFarmAndData = async () => {
    if (!user) return;

    try {
      const { data: farms } = await supabase
        .from("farms")
        .select("id")
        .eq("farmer_id", user.id)
        .limit(1)
        .single();

      if (!farms) {
        const { data: newFarm } = await supabase
          .from("farms")
          .insert({
            farmer_id: user.id,
            farm_name: "My Farm",
            location: "Default Location",
          })
          .select()
          .single();
        
        if (newFarm) setFarmId(newFarm.id);
        return;
      }

      setFarmId(farms.id);

      const { data } = await supabase
        .from("sensor_data")
        .select("*")
        .eq("farm_id", farms.id)
        .order("recorded_at", { ascending: true })
        .limit(20);

      if (data && data.length > 0) {
        setSensorData(data);
        const latest = data[data.length - 1];
        setCurrentValues({
          soil_moisture: latest.soil_moisture || 0,
          temperature: latest.temperature || 0,
          humidity: latest.humidity || 0,
          light_intensity: latest.light_intensity || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  const chartData = sensorData.map(reading => ({
    time: new Date(reading.recorded_at).toLocaleTimeString(),
    ...reading,
  }));

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Sensor Data (ESP32 Live Feed)</h1>
          <p className="text-muted-foreground mt-2">Real-time data from your ESP32 device</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SensorCard
            title="Soil Moisture"
            value={currentValues.soil_moisture}
            unit="%"
            data={chartData}
            dataKey="soil_moisture"
            color="#16a34a"
          />
          <SensorCard
            title="Temperature"
            value={currentValues.temperature}
            unit="°C"
            data={chartData}
            dataKey="temperature"
            color="#dc2626"
          />
          <SensorCard
            title="Humidity"
            value={currentValues.humidity}
            unit="%"
            data={chartData}
            dataKey="humidity"
            color="#2563eb"
          />
          <SensorCard
            title="Light Intensity"
            value={currentValues.light_intensity}
            unit="lux"
            data={chartData}
            dataKey="light_intensity"
            color="#f59e0b"
          />
        </div>
      </div>
    </Layout>
  );
};

const SensorCard = ({ title, value, unit, data, dataKey, color }: {
  title: string;
  value: number;
  unit: string;
  data: any[];
  dataKey: string;
  color: string;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>{title}</span>
        <span className="text-3xl font-bold text-primary">
          {value.toFixed(dataKey === "light_intensity" ? 0 : 1)} {unit}
        </span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px"
            }} 
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default Sensors;