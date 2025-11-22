import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload as UploadIcon, Camera, Plane, Video } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Helper function to create alerts for high/medium infestations
const createAlertIfNeeded = async (reportId: string, scanType: string) => {
  try {
    // Get the report details
    const { data: report, error: reportError } = await supabase
      .from('analysis_reports')
      .select('infestation_level, farm_id')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      console.error('Error fetching report:', reportError);
      return;
    }

    // Only create alert for HIGH or MEDIUM infestations
    if (report.infestation_level === 'HIGH' || report.infestation_level === 'MEDIUM') {
      const scanTypeLabel = scanType === 'spot_check' ? 'Spot Check' : scanType === 'drone_flight' ? 'Drone Scan' : 'Live Scan';
      
      const { error: alertError } = await supabase
        .from('alerts')
        .insert({
          farm_id: report.farm_id,
          alert_type: 'Pest Detection Alert',
          severity: report.infestation_level === 'HIGH' ? 'critical' : 'high',
          message: `A ${report.infestation_level} infestation level was found in your recent ${scanTypeLabel}. Check report for details.`,
          type: 'pest',
          priority: 1,
          is_read: false
        });

      if (alertError) {
        console.error('Error creating alert:', alertError);
      }
    }
  } catch (error) {
    console.error('Error in createAlertIfNeeded:', error);
  }
};

const Upload = () => {
  const navigate = useNavigate();
  const [spotCheckFile, setSpotCheckFile] = useState<File | null>(null);
  const [droneFile, setDroneFile] = useState<File | null>(null);
  const [spotCheckLoading, setSpotCheckLoading] = useState(false);
  const [droneLoading, setDroneLoading] = useState(false);
  const [spotCheckPreview, setSpotCheckPreview] = useState<string | null>(null);
  const [dronePreview, setDronePreview] = useState<string | null>(null);
  
  // Live Scan state
  const [liveScanActive, setLiveScanActive] = useState(false);
  const [liveScanLoading, setLiveScanLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Live Scan functions
  const startCamera = async () => {
    try {
      setCameraError(null);
      console.log('Requesting camera access...');
      
      // Show video element first
      setLiveScanActive(true);
      
      // Wait for next render cycle to ensure video element is in DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!videoRef.current) {
        throw new Error('Video element not available after render');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera access granted, stream obtained');
      streamRef.current = stream;
      
      const videoElement = videoRef.current;
      
      // Set srcObject
      videoElement.srcObject = stream;
      console.log('Stream assigned to video element');
      
      // Wait for metadata to load
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video loading timeout'));
        }, 10000);
        
        videoElement.onloadedmetadata = () => {
          console.log('Video metadata loaded', {
            width: videoElement.videoWidth,
            height: videoElement.videoHeight
          });
          clearTimeout(timeout);
          resolve();
        };
      });
      
      // Explicitly play the video
      console.log('Attempting to play video...');
      await videoElement.play();
      console.log('Video playing successfully');
      
      // Wait for first frame
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify video is ready
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        throw new Error('Video dimensions are invalid');
      }
      
      console.log('Camera ready with dimensions:', {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      });
      
      toast.success("Camera ready");
    } catch (error) {
      console.error('Camera initialization error:', error);
      
      // Clean up on error
      setLiveScanActive(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setCameraError(`Camera initialization failed: ${errorMessage}`);
      toast.error("Failed to start camera");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setLiveScanActive(false);
  };

  const captureFrame = async () => {
    if (!videoRef.current) return;

    setLiveScanLoading(true);
    try {
      // Verify video is ready with valid dimensions
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        throw new Error('Video stream not ready. Please wait a moment and try again.');
      }

      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to convert frame to image'));
        }, 'image/jpeg', 0.95);
      });

      // Create file from blob
      const file = new File([blob], `live-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Upload to storage
      const fileExt = 'jpg';
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('crop-scans')
        .upload(filePath, file);

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
          scanType: 'live_scan'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success(`Detection complete! Found ${data.detectionsCount || data.detections?.length || 0} pest(s)`);
      
      // Create alert if high/medium infestation detected
      await createAlertIfNeeded(data.reportId, 'live_scan');
      
      // Stop camera and redirect
      stopCamera();
      navigate(`/farmer/report/${data.reportId}`);
    } catch (error) {
      console.error('Error during live scan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze frame');
    } finally {
      setLiveScanLoading(false);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      recordedChunksRef.current = [];
      setRecordingDuration(0);
      
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        await uploadRecordedVideo();
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Start timer
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      toast.success("Recording started");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setLiveScanLoading(true);
      toast.info("Processing video...");
    }
  };

  const uploadRecordedVideo = async () => {
    try {
      // Create video blob
      const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const videoFile = new File([videoBlob], `live-scan-${Date.now()}.webm`, { type: 'video/webm' });

      // Upload to storage
      const fileName = `${Math.random()}.webm`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('crop-scans')
        .upload(filePath, videoFile);

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
          scanType: 'live_scan'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success(`Detection complete! Found ${data.detectionsCount || data.detections?.length || 0} pest(s)`);
      
      // Create alert if high/medium infestation detected
      await createAlertIfNeeded(data.reportId, 'live_scan');
      
      // Stop camera and redirect
      stopCamera();
      navigate(`/farmer/report/${data.reportId}`);
    } catch (error) {
      console.error('Error uploading recorded video:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze video');
    } finally {
      setLiveScanLoading(false);
      recordedChunksRef.current = [];
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      stopCamera();
    };
  }, []);

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
      
      // Create alert if high/medium infestation detected
      await createAlertIfNeeded(data.reportId, 'spot_check');
      
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
      
      // Create alert if high/medium infestation detected
      await createAlertIfNeeded(data.reportId, 'drone_flight');
      
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
        
        {/* Live Scan Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Video className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Live Scan (Real-time Monitoring)</CardTitle>
                <CardDescription>Use your device camera for instant crop health analysis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!liveScanActive ? (
              <div className="flex flex-col items-center justify-center py-8">
                {cameraError ? (
                  <div className="text-center mb-4">
                    <p className="text-destructive mb-4">{cameraError}</p>
                    <Button onClick={startCamera} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <Button onClick={startCamera} size="lg">
                    <Camera className="mr-2 h-5 w-5" />
                    Start Camera
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {isRecording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      <span className="text-sm font-medium">
                        Recording {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button 
                    onClick={captureFrame} 
                    disabled={liveScanLoading || isRecording}
                    size="lg"
                    variant="outline"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {liveScanLoading ? "Analyzing..." : "Capture Frame"}
                  </Button>
                  {!isRecording ? (
                    <Button 
                      onClick={startRecording} 
                      disabled={liveScanLoading}
                      size="lg"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopRecording} 
                      disabled={liveScanLoading}
                      size="lg"
                      variant="destructive"
                    >
                      Stop Recording
                    </Button>
                  )}
                  <Button 
                    onClick={stopCamera} 
                    variant="outline"
                    disabled={liveScanLoading || isRecording}
                  >
                    Stop Camera
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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