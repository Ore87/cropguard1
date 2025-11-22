import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Play, Square } from "lucide-react";
import { toast } from "sonner";
import { checkAndCreateSensorAlerts } from "@/utils/sensorAlerts";

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
  const [isSimulating, setIsSimulating] = useState(false);
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
    let interval: NodeJS.Timeout;
    
    if (isSimulating) {
      interval = setInterval(() => {
        simulateSensorData();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, farmId]);

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

  const simulateSensorData = async () => {
    if (!farmId) return;

    const newData = {
      soil_moisture: Number((45 + Math.random() * 20).toFixed(2)),
      temperature: Number((20 + Math.random() * 15).toFixed(2)),
      humidity: Number((60 + Math.random() * 20).toFixed(2)),
      light_intensity: Number((5000 + Math.random() * 10000).toFixed(0)),
    };

    try {
      const { data, error } = await supabase
        .from("sensor_data")
        .insert({
          farm_id: farmId,
          ...newData,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentValues(newData);
      setSensorData(prev => [...prev.slice(-19), data]);

      // Check and create alerts based on sensor values
      await checkAndCreateSensorAlerts(farmId, newData);
    } catch (error) {
      console.error("Error simulating data:", error);
    }
  };

  const toggleSimulation = () => {
    if (!isSimulating) {
      toast.success("IoT simulation started");
    } else {
      toast.info("IoT simulation stopped");
    }
    setIsSimulating(!isSimulating);
  };

  const chartData = sensorData.map(reading => ({
    time: new Date(reading.recorded_at).toLocaleTimeString(),
    ...reading,
  }));

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Sensor Data (IoT Monitor)</h1>
          <Button onClick={toggleSimulation} variant={isSimulating ? "destructive" : "default"}>
            {isSimulating ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isSimulating ? "Stop Simulation" : "Simulate IoT Data"}
          </Button>
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