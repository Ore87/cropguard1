import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload as UploadIcon, Camera, Plane } from "lucide-react";
import { toast } from "sonner";

const Upload = () => {
  const [spotCheckFile, setSpotCheckFile] = useState<File | null>(null);
  const [droneFile, setDroneFile] = useState<File | null>(null);
  const [spotCheckLoading, setSpotCheckLoading] = useState(false);
  const [droneLoading, setDroneLoading] = useState(false);

  const handleSpotCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotCheckFile) {
      toast.error("Please select an image");
      return;
    }

    setSpotCheckLoading(true);
    toast.info("This feature requires the EXTERNAL_AI_URL secret to be configured");
    
    // TODO: Implement API call to external AI service
    setTimeout(() => {
      setSpotCheckLoading(false);
      toast.success("Image uploaded successfully (simulation)");
    }, 2000);
  };

  const handleDroneFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!droneFile) {
      toast.error("Please select an image or video");
      return;
    }

    setDroneLoading(true);
    toast.info("This feature requires the EXTERNAL_AI_URL secret to be configured");
    
    // TODO: Implement API call to external AI service
    setTimeout(() => {
      setDroneLoading(false);
      toast.success("Drone imagery uploaded successfully (simulation)");
    }, 2000);
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="mb-6 text-3xl font-bold text-foreground">Data Collection</h1>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Camera className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Spot Check (Quick Scan)</CardTitle>
                  <CardDescription>Upload a single image for instant analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSpotCheck} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Upload Image
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSpotCheckFile(e.target.files?.[0] || null)}
                    disabled={spotCheckLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, WEBP
                  </p>
                </div>
                
                {spotCheckFile && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm font-medium text-foreground">Selected file:</p>
                    <p className="text-sm text-muted-foreground">{spotCheckFile.name}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={spotCheckLoading || !spotCheckFile}
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  {spotCheckLoading ? "Analyzing..." : "Analyze Image"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Plane className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Drone Flight (Deep Scan)</CardTitle>
                  <CardDescription>Upload high-resolution drone imagery</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDroneFlight} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Upload Drone Imagery
                  </label>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setDroneFile(e.target.files?.[0] || null)}
                    disabled={droneLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, MP4, MOV
                  </p>
                </div>
                
                {droneFile && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm font-medium text-foreground">Selected file:</p>
                    <p className="text-sm text-muted-foreground">{droneFile.name}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={droneLoading || !droneFile}
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  {droneLoading ? "Processing..." : "Process Drone Data"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Spot Check</h3>
              <p className="text-sm text-muted-foreground">
                Perfect for quick inspections. Snap a photo with your phone camera and get instant 
                pest detection results with bounding boxes and confidence scores.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Drone Flight</h3>
              <p className="text-sm text-muted-foreground">
                For comprehensive field analysis. Upload high-resolution aerial imagery to detect 
                pest infestations across large areas with precise geolocation data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Upload;