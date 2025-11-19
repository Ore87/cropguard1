-- Add explicit DENY policies for anonymous access to all tables
-- This prevents unauthenticated users from accessing sensitive data

-- Deny anonymous access to profiles table (contains PII)
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to user_roles table
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to farms table
CREATE POLICY "Deny anonymous access to farms"
ON public.farms
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to analysis_reports table
CREATE POLICY "Deny anonymous access to analysis_reports"
ON public.analysis_reports
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to sensor_data table
CREATE POLICY "Deny anonymous access to sensor_data"
ON public.sensor_data
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to alerts table
CREATE POLICY "Deny anonymous access to alerts"
ON public.alerts
FOR SELECT
TO anon
USING (false);