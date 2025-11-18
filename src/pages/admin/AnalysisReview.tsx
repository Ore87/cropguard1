import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3 } from "lucide-react";

interface AnalysisReport {
  id: string;
  scan_type: string;
  image_url: string;
  infestation_level: string;
  confidence_score: number;
  pest_types: any;
  analyzed_at: string;
  farm: {
    farm_name: string;
    farmer: {
      full_name: string;
      email: string;
    };
  };
}

const AnalysisReview = () => {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await supabase
        .from("analysis_reports")
        .select(`
          id,
          scan_type,
          image_url,
          infestation_level,
          confidence_score,
          pest_types,
          analyzed_at,
          farms!analysis_reports_farm_id_fkey (
            farm_name,
            profiles!farms_farmer_id_fkey (
              full_name,
              email
            )
          )
        `)
        .order("analyzed_at", { ascending: false });

      if (data) {
        const formattedData = data.map((report: any) => ({
          id: report.id,
          scan_type: report.scan_type,
          image_url: report.image_url,
          infestation_level: report.infestation_level,
          confidence_score: report.confidence_score,
          pest_types: report.pest_types,
          analyzed_at: report.analyzed_at,
          farm: {
            farm_name: report.farms?.farm_name || "Unknown",
            farmer: {
              full_name: report.farms?.profiles?.full_name || "Unknown",
              email: report.farms?.profiles?.email || "Unknown",
            },
          },
        }));
        setReports(formattedData);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "alert";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">AI Analysis Review</h1>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Analysis Reports</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Analysis reports from all farms will appear here once farmers start uploading images.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {report.scan_type === "spot_check" ? "Spot Check" : "Drone Flight"}
                    </CardTitle>
                    <Badge variant={getSeverityColor(report.infestation_level) as any}>
                      {report.infestation_level || "Unknown"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {report.farm.farm_name} - {report.farm.farmer.full_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
                    <img
                      src={report.image_url}
                      alt="Analysis result"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Farmer Email</span>
                      <span className="font-medium text-foreground">
                        {report.farm.farmer.email}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confidence Score</span>
                      <span className="font-semibold text-foreground">
                        {report.confidence_score?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Analyzed</span>
                      <span className="text-foreground">
                        {new Date(report.analyzed_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {report.pest_types && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Detected Pests:</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(report.pest_types) && report.pest_types.map((pest: string, idx: number) => (
                            <Badge key={idx} variant="outline">{pest}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AnalysisReview;