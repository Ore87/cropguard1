-- Add 'live_scan' to the allowed scan_type values in analysis_reports table
ALTER TABLE public.analysis_reports 
DROP CONSTRAINT IF EXISTS analysis_reports_scan_type_check;

ALTER TABLE public.analysis_reports 
ADD CONSTRAINT analysis_reports_scan_type_check 
CHECK (scan_type IN ('spot_check', 'drone_flight', 'live_scan'));