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

    // Prepare multipart form data
    const formData = new FormData();
    formData.append('file', imageData, 'image.jpg');

    console.log('Calling AI detection API...');

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

    // Extract detection information
    const detections = detectionResult.detections || [];
    
    // Calculate infestation level based on number of detections
    let infestationLevel = 'none';
    let confidenceScore = 0;
    const pestTypes: string[] = [];

    if (detections.length > 0) {
      // Calculate average confidence
      confidenceScore = detections.reduce((sum: number, det: any) => sum + (det.confidence || 0), 0) / detections.length;
      
      // Determine infestation level
      if (detections.length >= 10) {
        infestationLevel = 'critical';
      } else if (detections.length >= 5) {
        infestationLevel = 'high';
      } else if (detections.length >= 2) {
        infestationLevel = 'moderate';
      } else {
        infestationLevel = 'low';
      }

      // Extract unique pest types
      const uniquePests = new Set<string>(detections.map((det: any) => det.class || 'Fall Armyworm'));
      pestTypes.push(...Array.from(uniquePests));
    }

    // Save to database
    const { data: reportData, error: insertError } = await supabase
      .from('analysis_reports')
      .insert({
        farm_id: farmData.id,
        scan_type: scanType,
        image_url: imageUrl,
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
        infestationLevel,
        confidenceScore,
        pestTypes,
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