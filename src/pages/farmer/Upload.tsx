import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload as UploadIcon, Camera, Plane } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Upload = () => {
  const navigate = useNavigate();
  const [spotCheckFile, setSpotCheckFile] = useState<File | null>(null);
  const [droneFile, setDroneFile] = useState<File | null>(null);
  const [spotCheckLoading, setSpotCheckLoading] = useState(false);
  const [droneLoading, setDroneLoading] = useState(false);
  const [spotCheckPreview, setSpotCheckPreview] = useState<string | null>(null);
  const [dronePreview, setDronePreview] = useState<string | null>(null);

  const handleSpotCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotCheckFile) {
      toast.error("Please select an image");
      return;
    }

    setSpotCheckLoading(true);
    
    try {
      // Upload image to storage
      const fileExt = spotCheckFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('crop-scans')
        .upload(filePath, spotCheckFile);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('crop-scans')
        .getPublicUrl(filePath);

      // Call detection edge function
      const { data, error } = await supabase.functions.invoke('detect-pest', {
        body: { 
          imageUrl: publicUrl,
          scanType: 'spot_check'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success(`Detection complete! Found ${data.detectionsCount || data.detections?.length || 0} pest(s)`);
      
      // Redirect to report details
      navigate(`/farmer/report/${data.reportId}`);
    } catch (error) {
      console.error('Error during spot check:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze image');
    } finally {
      setSpotCheckLoading(false);
    }
  };

  const handleDroneFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!droneFile) {
      toast.error("Please select an image or video");
      return;
    }

    setDroneLoading(true);
    
    try {
      // Upload image to storage
      const fileExt = droneFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('crop-scans')
        .upload(filePath, droneFile);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('crop-scans')
        .getPublicUrl(filePath);

      // Call detection edge function
      const { data, error } = await supabase.functions.invoke('detect-pest', {
        body: { 
          imageUrl: publicUrl,
          scanType: 'drone_flight'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success(`Detection complete! Found ${data.detectionsCount || data.detections?.length || 0} pest(s)`);
      
      // Redirect to report details
      navigate(`/farmer/report/${data.reportId}`);
    } catch (error) {
      console.error('Error during drone flight:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze image');
    } finally {
      setDroneLoading(false);
    }
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
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSpotCheckFile(file);
                      if (file) {
                        setSpotCheckPreview(URL.createObjectURL(file));
                      } else {
                        setSpotCheckPreview(null);
                      }
                    }}
                    disabled={spotCheckLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, WEBP, MP4, AVI, MOV
                  </p>
                </div>
                
                {spotCheckFile && spotCheckPreview && (
                  <div className="rounded-lg border border-border p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">Selected file:</p>
                    <p className="text-sm text-muted-foreground">{spotCheckFile.name}</p>
                    {spotCheckFile.type.startsWith('image/') ? (
                      <img src={spotCheckPreview} alt="Preview" className="w-full rounded-md mt-2" />
                    ) : (
                      <video src={spotCheckPreview} controls className="w-full rounded-md mt-2" />
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={spotCheckLoading || !spotCheckFile}
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  {spotCheckLoading ? "Analyzing..." : "Upload Image or Video"}
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
                    Upload High-Resolution Image
                  </label>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setDroneFile(file);
                      if (file) {
                        setDronePreview(URL.createObjectURL(file));
                      } else {
                        setDronePreview(null);
                      }
                    }}
                    disabled={droneLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, WEBP, MP4, AVI, MOV
                  </p>
                </div>
                
                {droneFile && dronePreview && (
                  <div className="rounded-lg border border-border p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">Selected file:</p>
                    <p className="text-sm text-muted-foreground">{droneFile.name}</p>
                    {droneFile.type.startsWith('image/') ? (
                      <img src={dronePreview} alt="Preview" className="w-full rounded-md mt-2" />
                    ) : (
                      <video src={dronePreview} controls className="w-full rounded-md mt-2" />
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={droneLoading || !droneFile}
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  {droneLoading ? "Processing..." : "Upload Image or Video"}
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
                For comprehensive field analysis. Upload high-resolution aerial imagery or drone footage to detect 
                pest infestations across large areas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Upload;