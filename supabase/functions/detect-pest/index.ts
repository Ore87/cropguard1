import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageUrl, scanType } = await req.json();

    console.log('Processing detection for user:', user.id);
    console.log('Image URL:', imageUrl);
    console.log('Scan type:', scanType);

    // Get the farm_id for the user
    const { data: farmData, error: farmError } = await supabase
      .from('farms')
      .select('id')
      .eq('farmer_id', user.id)
      .maybeSingle();

    if (farmError) {
      console.error('Farm fetch error:', farmError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch farm data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!farmData) {
      console.error('No farm found for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'No farm associated with user. Please create a farm first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Download the image from Supabase Storage
    const imagePathMatch = imageUrl.match(/crop-scans\/(.+)$/);
    if (!imagePathMatch) {
      return new Response(
        JSON.stringify({ error: 'Invalid image URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imagePath = imagePathMatch[1];
    
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('crop-scans')
      .download(imagePath);

    if (downloadError || !imageData) {
      console.error('Image download error:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect file type and set appropriate MIME type
    const fileExtension = imagePath.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg';
    let fileName = 'file.jpg';
    
    if (fileExtension === 'mp4') {
      mimeType = 'video/mp4';
      fileName = 'video.mp4';
    } else if (fileExtension === 'avi') {
      mimeType = 'video/x-msvideo';
      fileName = 'video.avi';
    } else if (fileExtension === 'mov') {
      mimeType = 'video/quicktime';
      fileName = 'video.mov';
    } else if (fileExtension === 'webm') {
      mimeType = 'video/webm';
      fileName = 'video.webm';
    } else if (fileExtension === 'png') {
      mimeType = 'image/png';
      fileName = 'image.png';
    } else if (fileExtension === 'webp') {
      mimeType = 'image/webp';
      fileName = 'image.webp';
    }

    console.log('File type detected:', fileExtension, 'MIME type:', mimeType);

    // Prepare multipart form data with proper file blob
    const formData = new FormData();
    const blob = new Blob([imageData], { type: mimeType });
    formData.append('file', blob, fileName);

    console.log('Calling AI detection API with image size:', imageData.size);

    // Call the external AI API
    const aiResponse = await fetch('https://Ore5187-cropguard-ai-backend.hf.space/detect/', {
      method: 'POST',
      body: formData,
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `AI detection failed: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const detectionResult = await aiResponse.json();
    console.log('Detection result:', JSON.stringify(detectionResult));

    // Extract detection information from new API format
    const mediaType = detectionResult.type || 'image'; // 'image' or 'video'
    const analyzedMedia = detectionResult.analyzed_image || detectionResult.analyzed_video || '';
    const detectionsCount = detectionResult.detections_count || 0;
    
    // For backward compatibility, try to get detections array if available
    const detections = detectionResult.detections || [];
    
    // Calculate infestation level based on detections count
    let infestationLevel = 'none';
    let confidenceScore = 0;
    const pestTypes: string[] = [];

    if (detectionsCount > 0 || detections.length > 0) {
      const count = detectionsCount || detections.length;
      
      // Calculate average confidence if detections array is available
      if (detections.length > 0) {
        confidenceScore = detections.reduce((sum: number, det: any) => sum + (det.confidence || 0), 0) / detections.length;
        
        // Extract unique pest types
        const uniquePests = new Set<string>(detections.map((det: any) => det.class || 'Fall Armyworm'));
        pestTypes.push(...Array.from(uniquePests));
      } else {
        confidenceScore = 0.85; // Default confidence when only count is provided
        pestTypes.push('Fall Armyworm');
      }
      
      // Determine infestation level
      if (count >= 10) {
        infestationLevel = 'critical';
      } else if (count >= 5) {
        infestationLevel = 'high';
      } else if (count >= 2) {
        infestationLevel = 'moderate';
      } else {
        infestationLevel = 'low';
      }
    }

    // Save to database with new fields
    const { data: reportData, error: insertError } = await supabase
      .from('analysis_reports')
      .insert({
        farm_id: farmData.id,
        scan_type: scanType,
        image_url: imageUrl,
        media_type: mediaType,
        analyzed_media: analyzedMedia,
        infestation_level: infestationLevel,
        confidence_score: confidenceScore,
        pest_types: pestTypes,
        bounding_boxes: detections,
        analyzed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysis report saved successfully:', reportData.id);

    return new Response(
      JSON.stringify({
        reportId: reportData.id,
        detections,
        detectionsCount,
        infestationLevel,
        confidenceScore,
        pestTypes,
        mediaType,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in detect-pest function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});