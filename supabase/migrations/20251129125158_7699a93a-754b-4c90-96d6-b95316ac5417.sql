-- Add unique_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN unique_id TEXT UNIQUE;

-- Create a sequence for generating unique IDs
CREATE SEQUENCE IF NOT EXISTS user_id_sequence START 10001;

-- Update the handle_new_user function to create both profile and farm
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_unique_id TEXT;
  new_farm_id UUID;
BEGIN
  -- Generate unique ID (format: CG-10001, CG-10002, etc.)
  new_unique_id := 'CG-' || LPAD(nextval('user_id_sequence')::TEXT, 5, '0');
  
  -- Insert profile with unique_id
  INSERT INTO public.profiles (id, email, full_name, role, unique_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'farmer'),
    new_unique_id
  );
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'farmer')
  );
  
  -- Auto-create a farm for the user
  INSERT INTO public.farms (farmer_id, farm_name, location)
  VALUES (
    NEW.id,
    'My Farm',
    COALESCE(NEW.raw_user_meta_data->>'farm_location', 'Not specified')
  );
  
  RETURN NEW;
END;
$$;

-- Update existing users to have unique IDs (for users who already signed up)
DO $$
DECLARE
  user_record RECORD;
  new_unique_id TEXT;
BEGIN
  FOR user_record IN SELECT id FROM public.profiles WHERE unique_id IS NULL
  LOOP
    new_unique_id := 'CG-' || LPAD(nextval('user_id_sequence')::TEXT, 5, '0');
    UPDATE public.profiles SET unique_id = new_unique_id WHERE id = user_record.id;
    
    -- Create farm for existing users who don't have one
    INSERT INTO public.farms (farmer_id, farm_name, location)
    SELECT user_record.id, 'My Farm', 'Not specified'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.farms WHERE farmer_id = user_record.id
    );
  END LOOP;
END $$;