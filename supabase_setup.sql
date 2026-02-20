-- Extensions andTypes
CREATE TYPE user_role AS ENUM ('Admin', 'Editor', 'Viewer');

-- Table for profiles (Extiende Auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'Viewer' NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Table for credentials
CREATE TABLE credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  username TEXT,
  password TEXT NOT NULL,
  description TEXT,
  two_fa_seed TEXT, -- Semilla para algoritmo TOTP
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- able for sharing credentials
CREATE TABLE credential_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credential_id UUID REFERENCES credentials(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES profiles(id) NOT NULL,
  UNIQUE(credential_id, shared_with)
);

-- ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_shares ENABLE ROW LEVEL SECURITY;

-- FUNCTIONS
-- Check if user is Admin.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'Admin' AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users can see shares assigned to them
CREATE OR REPLACE FUNCTION check_credential_access(check_credential_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM credentials 
    WHERE id = check_credential_id AND created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM credential_shares 
    WHERE credential_id = check_credential_id AND shared_with = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES RLS (Security)

-- Profiles: 
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

-- Credentials:
-- Admins can view all credentials
CREATE POLICY "Admins can view all credentials" ON credentials
  FOR ALL USING (public.is_admin());

-- Editors manage their credentials (create, read, update, delete)
CREATE POLICY "Editors manage their credentials" ON credentials 
  FOR ALL USING (created_by = auth.uid());

-- Viewers see shared credentials
CREATE POLICY "Viewers see shared credentials" ON credentials 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM credential_shares WHERE credential_id = credentials.id AND shared_with = auth.uid()
  ));

-- Editors can update shared credentials
CREATE POLICY "Editors update shared credentials" ON credentials
  FOR UPDATE USING (
    check_credential_access(id) AND is_authorized_editor()
  );

-- Credential Shares:
-- Admins can manage shares
CREATE POLICY "Admins manage shares" ON credential_shares
  FOR ALL USING (public.is_admin());

-- Editors manage (delete) shares if they have access
CREATE POLICY "Editors manage shares" ON credential_shares
  FOR DELETE USING (
    check_credential_access(credential_id)
  );

-- Editors can share their own credentials or ones shared with them
CREATE POLICY "Editors share accessible credentials" ON credential_shares
  FOR INSERT WITH CHECK (
    -- Eres el dueño
    EXISTS (SELECT 1 FROM credentials WHERE id = credential_id AND created_by = auth.uid())
    OR
    -- O ya se te ha compartido a ti (tienes acceso de lectura)
    EXISTS (SELECT 1 FROM credential_shares WHERE credential_id = credential_id AND shared_with = auth.uid())
  );

-- Users can see shares assigned to them (and others if they have access)
CREATE POLICY "Editors view all shares of accessible credentials" ON credential_shares
  FOR SELECT USING (
    check_credential_access(credential_id)
  );

-- TRIGGERS
-- Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, active)
  VALUES (new.id, new.email, 'Viewer', true);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SEED DATA 
-- Create Admin User
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ 
DECLARE
  new_admin_id UUID;
BEGIN
  -- Check if user already exists to avoid duplication when running the script multiple times
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@securepass.com') THEN
    -- Insert the user into au.users with an encrypted password
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@securepasscorp.com',
      crypt('AdminSPC022026!', gen_salt('bf')),
      current_timestamp,
      current_timestamp,
      current_timestamp,
      '{"provider":"email","providers":["email"]}',
      '{}',
      current_timestamp,
      current_timestamp,
      '',
      '',
      '',
      ''
    ) RETURNING id INTO new_admin_id;

    -- The trigger 'handle_new_user' will create the profile in public.profiles with the 'Viewer' role.
    -- Automatically update it to 'Admin'.
    UPDATE public.profiles 
    SET role = 'Admin' 
    WHERE id = new_admin_id;

  END IF;
END $$;
