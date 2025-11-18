import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Detection {
  class: string;
  confidence: number;
  box: number[]; // [x, y, width, height]
}

interface Report {
  id: string;
  scan_type: string;
  image_url: string;
  media_type: string;
  analyzed_media: string;
  infestation_level: string;
  confidence_score: number;
  pest_types: string[];
  bounding_boxes: Detection[];
  analyzed_at: string;
}

const ReportDetails = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;
      
      setReport({
        ...data,
        bounding_boxes: (data.bounding_boxes as unknown as Detection[]) || [],
        pest_types: (data.pest_types as unknown as string[]) || []
      } as Report);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (report && imageRef.current && canvasRef.current) {
      drawBoundingBoxes();
    }
  }, [report]);

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !report) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Wait for image to load
    if (!image.complete) {
      image.onload = () => drawBoundingBoxes();
      return;
    }

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw the image
    ctx.drawImage(image, 0, 0);

    // Draw bounding boxes
    if (report.bounding_boxes && report.bounding_boxes.length > 0) {
      report.bounding_boxes.forEach((detection: Detection) => {
        const [x, y, width, height] = detection.box;
        
        // Draw box
        ctx.strokeStyle = '#ef4444'; // red
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Draw label background
        const label = `${detection.class} (${(detection.confidence * 100).toFixed(1)}%)`;
        ctx.font = 'bold 16px Arial';
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x, y - 25, textWidth + 10, 25);

        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + 5, y - 7);
      });
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'moderate':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading report...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="p-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">Report not found</p>
              <Link to="/farmer/analysis">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/farmer/analysis">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reports
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Analysis Report</h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Detection Results</CardTitle>
            </CardHeader>
            <CardContent>
              {report.media_type === 'video' ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full rounded-lg border border-border"
                    src={`data:video/mp4;base64,${report.analyzed_media}`}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="relative">
                  <img
                    ref={imageRef}
                    src={report.analyzed_media ? `data:image/jpeg;base64,${report.analyzed_media}` : report.image_url}
                    alt="Analyzed crop"
                    className="hidden"
                    crossOrigin="anonymous"
                  />
                  <canvas
                    ref={canvasRef}
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              )}
              
              {report.bounding_boxes && report.bounding_boxes.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Detected Pests ({report.bounding_boxes.length})
                  </h3>
                  <div className="space-y-2">
                    {report.bounding_boxes.map((detection: Detection, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                        <span className="text-sm font-medium text-foreground">{detection.class}</span>
                        <Badge variant="outline">
                          {(detection.confidence * 100).toFixed(1)}% confidence
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Scan Type</p>
                  <p className="font-medium text-foreground capitalize">
                    {report.scan_type.replace('_', ' ')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Infestation Level</p>
                  <Badge variant={getSeverityColor(report.infestation_level)}>
                    {report.infestation_level.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Confidence Score</p>
                  <p className="font-medium text-foreground">
                    {(report.confidence_score * 100).toFixed(1)}%
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Analyzed At</p>
                  <p className="font-medium text-foreground">
                    {new Date(report.analyzed_at).toLocaleString()}
                  </p>
                </div>

                {report.pest_types && report.pest_types.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Detected Pest Types</p>
                    <div className="flex flex-wrap gap-2">
                      {report.pest_types.map((pest, index) => (
                        <Badge key={index} variant="secondary">
                          {pest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportDetails;