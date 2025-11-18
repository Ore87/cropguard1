-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('farmer', 'agronomist');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'farmer',
  farm_location TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create farms table for admin management
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  farm_name TEXT NOT NULL,
  location TEXT NOT NULL,
  size_hectares DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sensor_data table for IoT monitoring
CREATE TABLE public.sensor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  soil_moisture DECIMAL(5,2),
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  light_intensity DECIMAL(8,2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create analysis_reports table for AI pest detection
CREATE TABLE public.analysis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('spot_check', 'drone_flight')),
  image_url TEXT NOT NULL,
  bounding_boxes JSONB,
  infestation_level TEXT,
  pest_types JSONB,
  confidence_score DECIMAL(5,2),
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Agronomists can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'agronomist'));

-- User roles RLS policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Agronomists can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'agronomist'));

-- Farms RLS policies
CREATE POLICY "Farmers can view own farms"
  ON public.farms FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own farms"
  ON public.farms FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own farms"
  ON public.farms FOR UPDATE
  USING (auth.uid() = farmer_id);

CREATE POLICY "Agronomists can view all farms"
  ON public.farms FOR SELECT
  USING (public.has_role(auth.uid(), 'agronomist'));

-- Sensor data RLS policies
CREATE POLICY "Farmers can view own sensor data"
  ON public.sensor_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = sensor_data.farm_id
      AND farms.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can insert own sensor data"
  ON public.sensor_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = sensor_data.farm_id
      AND farms.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Agronomists can view all sensor data"
  ON public.sensor_data FOR SELECT
  USING (public.has_role(auth.uid(), 'agronomist'));

-- Analysis reports RLS policies
CREATE POLICY "Farmers can view own analysis reports"
  ON public.analysis_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = analysis_reports.farm_id
      AND farms.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can insert own analysis reports"
  ON public.analysis_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = analysis_reports.farm_id
      AND farms.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Agronomists can view all analysis reports"
  ON public.analysis_reports FOR SELECT
  USING (public.has_role(auth.uid(), 'agronomist'));

-- Alerts RLS policies
CREATE POLICY "Farmers can view own alerts"
  ON public.alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = alerts.farm_id
      AND farms.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can update own alerts"
  ON public.alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = alerts.farm_id
      AND farms.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Agronomists can view all alerts"
  ON public.alerts FOR SELECT
  USING (public.has_role(auth.uid(), 'agronomist'));

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for farms
CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'farmer')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'farmer')
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();