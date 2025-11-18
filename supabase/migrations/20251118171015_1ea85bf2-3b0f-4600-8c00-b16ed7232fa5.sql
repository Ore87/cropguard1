-- Add new columns to analysis_reports table to support video analysis
ALTER TABLE analysis_reports 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
ADD COLUMN IF NOT EXISTS analyzed_media TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_analysis_reports_media_type ON analysis_reports(media_type);