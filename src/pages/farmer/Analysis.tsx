import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileSearch, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AnalysisReport {
  id: string;
  scan_type: string;
  image_url: string;
  infestation_level: string;
  confidence_score: number;
  pest_types: any;
  analyzed_at: string;
}

const Analysis = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;

    try {
      const { data: farm, error: farmError } = await supabase
        .from("farms")
        .select("id")
        .eq("farmer_id", user.id)
        .maybeSingle();

      if (farmError) {
        console.error("Error fetching farm:", farmError);
        setLoading(false);
        return;
      }

      if (!farm) {
        setLoading(false);
        return;
      }

      const { data, error: reportsError } = await supabase
        .from("analysis_reports")
        .select("*")
        .eq("farm_id", farm.id)
        .order("analyzed_at", { ascending: false })
        .limit(100); // Fetch more than needed for pagination

      if (reportsError) {
        console.error("Error fetching reports:", reportsError);
      }

      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllHistory = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const { data: farm, error: farmError } = await supabase
        .from("farms")
        .select("id")
        .eq("farmer_id", user.id)
        .maybeSingle();

      if (farmError || !farm) {
        toast.error("Failed to clear history");
        setIsDeleting(false);
        return;
      }

      const { error: deleteError } = await supabase
        .from("analysis_reports")
        .delete()
        .eq("farm_id", farm.id);

      if (deleteError) {
        toast.error("Failed to delete reports");
        console.error("Error deleting reports:", deleteError);
      } else {
        toast.success("All analysis reports have been deleted");
        setReports([]);
        setDisplayCount(20);
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("An error occurred while deleting reports");
    } finally {
      setIsDeleting(false);
      setShowClearDialog(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 20);
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

  const displayedReports = reports.slice(0, displayCount);
  const hasMore = displayCount < reports.length;

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <FileSearch className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">AI Analysis Reports</h1>
          </div>
          {reports.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowClearDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All History
            </Button>
          )}
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Upload images from the Scan for Pests page to see AI-powered pest detection results here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              {displayedReports.map((report) => (
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
                    Analyzed {new Date(report.analyzed_at).toLocaleString()}
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
                      <span className="text-muted-foreground">Confidence Score</span>
                      <span className="font-semibold text-foreground">
                        {report.confidence_score?.toFixed(1)}%
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
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button onClick={handleLoadMore} variant="outline" size="lg">
                  Load More Reports
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Analysis Reports?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all past analysis reports? This action cannot be undone and all historical data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllHistory}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Analysis;