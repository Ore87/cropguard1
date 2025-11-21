import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, subDays, parseISO } from "date-fns";

interface PriceDataPoint {
  date: string;
  price: number;
}

interface MarketSubmission {
  id: string;
  created_at: string;
  crop_name: string;
  price_per_kg: number;
}

const CROPS = [
  "Maize",
  "Rice (Local)",
  "Cassava",
  "Yam",
  "Sorghum",
  "Millet",
  "Cowpea (Beans)",
  "Groundnut"
];

const MarketTrends = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch market price submissions for the last 30 days
  const { data: submissions = [] } = useQuery({
    queryKey: ["market-prices"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data, error } = await supabase
        .from("market_price_submissions")
        .select("*")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as MarketSubmission[];
    },
  });

  // Submit price mutation
  const submitPriceMutation = useMutation({
    mutationFn: async ({ crop, priceValue }: { crop: string; priceValue: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("market_price_submissions")
        .insert({
          crop_name: crop,
          price_per_kg: priceValue,
          submitted_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-prices"] });
      toast({
        title: "Success",
        description: "Price submitted successfully!",
      });
      setIsDialogOpen(false);
      setSelectedCrop("");
      setPrice("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit price",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCrop || !price) {
      toast({
        title: "Validation Error",
        description: "Please select a crop and enter a price",
        variant: "destructive",
      });
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      });
      return;
    }

    submitPriceMutation.mutate({ crop: selectedCrop, priceValue });
  };

  // Process submissions into chart data by crop
  const processChartData = (cropName: string): PriceDataPoint[] => {
    const cropSubmissions = submissions.filter(s => s.crop_name === cropName);
    
    // Group by date and calculate daily averages
    const dailyPrices = new Map<string, number[]>();
    
    cropSubmissions.forEach(submission => {
      const dateKey = format(parseISO(submission.created_at), "MMM d");
      if (!dailyPrices.has(dateKey)) {
        dailyPrices.set(dateKey, []);
      }
      dailyPrices.get(dateKey)!.push(submission.price_per_kg);
    });

    // Calculate averages and create chart data
    const chartData: PriceDataPoint[] = [];
    dailyPrices.forEach((prices, date) => {
      const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      chartData.push({
        date,
        price: Math.round(average * 100) / 100,
      });
    });

    return chartData;
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">Regional Crop Price Trends (30-Day)</h1>
              <p className="text-muted-foreground">Community-sourced market data for key crops in your region</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Submit Today's Price
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Crop Price</DialogTitle>
                  <DialogDescription>
                    Help the community by sharing today's market price for crops in your area.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crop">Select Crop</Label>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                      <SelectTrigger id="crop">
                        <SelectValue placeholder="Choose a crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {CROPS.map((crop) => (
                          <SelectItem key={crop} value={crop}>
                            {crop}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₦/kg)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter price per kilogram"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitPriceMutation.isPending}>
                    {submitPriceMutation.isPending ? "Submitting..." : "Submit Price"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-8">
          {CROPS.map((cropName) => {
            const chartData = processChartData(cropName);
            const hasData = chartData.length > 0;

            return (
              <Card key={cropName}>
                <CardHeader>
                  <CardTitle className="text-xl">{cropName} Price History</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasData ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
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
                          formatter={(value: number) => [`₦${value.toFixed(2)}`, "Avg Price"]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", r: 3 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <p>No data available yet. Be the first to contribute!</p>
                    </div>
                  )}
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    Charts show average daily prices submitted by the community. Contribute today's price to see data.
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default MarketTrends;
