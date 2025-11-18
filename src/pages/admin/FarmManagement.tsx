import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Tractor } from "lucide-react";

interface Farm {
  id: string;
  farm_name: string;
  location: string;
  size_hectares: number;
  created_at: string;
  farmer: {
    full_name: string;
    email: string;
  };
}

const FarmManagement = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const { data } = await supabase
        .from("farms")
        .select(`
          id,
          farm_name,
          location,
          size_hectares,
          created_at,
          profiles!farms_farmer_id_fkey (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (data) {
        const formattedData = data.map((farm: any) => ({
          id: farm.id,
          farm_name: farm.farm_name,
          location: farm.location,
          size_hectares: farm.size_hectares,
          created_at: farm.created_at,
          farmer: {
            full_name: farm.profiles?.full_name || "Unknown",
            email: farm.profiles?.email || "Unknown",
          },
        }));
        setFarms(formattedData);
      }
    } catch (error) {
      console.error("Error fetching farms:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading farms...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <Tractor className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Farm Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Registered Farms</CardTitle>
          </CardHeader>
          <CardContent>
            {farms.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No farms registered yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farm Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Size (ha)</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farms.map((farm) => (
                    <TableRow key={farm.id}>
                      <TableCell className="font-medium">{farm.farm_name}</TableCell>
                      <TableCell>{farm.location}</TableCell>
                      <TableCell>
                        {farm.size_hectares ? `${farm.size_hectares} ha` : "N/A"}
                      </TableCell>
                      <TableCell>{farm.farmer.full_name}</TableCell>
                      <TableCell>{farm.farmer.email}</TableCell>
                      <TableCell>
                        {new Date(farm.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FarmManagement;