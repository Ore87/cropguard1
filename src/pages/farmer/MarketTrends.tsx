import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

interface PriceDataPoint {
  date: string;
  price: number;
}

interface CropData {
  name: string;
  data: PriceDataPoint[];
  color: string;
}

// Smart data simulation using Random Walk with Drift
const generatePriceData = (startPrice: number, days: number = 30): PriceDataPoint[] => {
  const data: PriceDataPoint[] = [];
  let currentPrice = startPrice;
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random Walk with Drift
    // Volatility: max ±1.5% daily movement
    const volatility = (Math.random() - 0.5) * 0.03; // -1.5% to +1.5%
    // Drift: tiny positive bias of +0.1%
    const drift = 0.001;
    
    // Calculate new price
    const changePercent = volatility + drift;
    currentPrice = currentPrice * (1 + changePercent);
    
    // Round to 2 decimal places
    currentPrice = Math.round(currentPrice * 100) / 100;
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: currentPrice
    });
  }
  
  return data;
};

const MarketTrends = () => {
  // Generate data once using useMemo to prevent regeneration on every render
  const crops: CropData[] = useMemo(() => [
    {
      name: "Maize",
      data: generatePriceData(850, 30),
      color: "#22c55e"
    },
    {
      name: "Rice (Local)",
      data: generatePriceData(1400, 30),
      color: "#22c55e"
    },
    {
      name: "Cassava",
      data: generatePriceData(400, 30),
      color: "#22c55e"
    }
  ], []);

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Regional Crop Price Trends (30-Day)</h1>
          <p className="text-muted-foreground">Simulated market data for key crops in your region</p>
        </div>

        <div className="space-y-8">
          {crops.map((crop) => (
            <Card key={crop.name}>
              <CardHeader>
                <CardTitle className="text-xl">{crop.name} Price History</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={crop.data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      label={{ 
                        value: "Price (₦/kg)", 
                        angle: -90, 
                        position: "insideLeft",
                        style: { fill: "hsl(var(--muted-foreground))" }
                      }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: "hsl(var(--foreground))"
                      }}
                      formatter={(value: number) => [`₦${value.toFixed(2)}`, "Price"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={crop.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default MarketTrends;
