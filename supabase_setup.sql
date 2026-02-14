-- Extensiones y Tipos
CREATE TYPE user_role AS ENUM ('Admin', 'Editor', 'Viewer');

-- 1. Tabla de Perfiles (Extiende Auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'Viewer' NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Credenciales
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

-- 3. Tabla para compartir credenciales
CREATE TABLE credential_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credential_id UUID REFERENCES credentials(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES profiles(id) NOT NULL,
  UNIQUE(credential_id, shared_with)
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_shares ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS (Seguridad)

-- Profiles: 
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));

-- Credenciales: 
-- Admins ven todo.
CREATE POLICY "Acceso total para Admins" ON credentials 
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));

-- Editores gestionan sus credenciales (crear, leer, actualizar, eliminar)
CREATE POLICY "Editores gestionan sus credenciales" ON credentials 
  FOR ALL USING (created_by = auth.uid());

-- Lectores ven credenciales compartidas
CREATE POLICY "Lectores ven credenciales compartidas" ON credentials 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM credential_shares WHERE credential_id = credentials.id AND shared_with = auth.uid()
  ));

-- Credential Shares:
-- Admins can manage shares
CREATE POLICY "Admins manage shares" ON credential_shares
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));

-- Users can see shares assigned to them
CREATE POLICY "Users view received shares" ON credential_shares
  FOR SELECT USING (shared_with = auth.uid());

-- Editors can share their own credentials
CREATE POLICY "Editors share own credentials" ON credential_shares
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM credentials WHERE id = credential_id AND created_by = auth.uid())
  );

CREATE POLICY "Editors manage shares of own credentials" ON credential_shares
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM credentials WHERE id = credential_id AND created_by = auth.uid()) OR
    shared_by = auth.uid()
  );

-- Trigger to create profile on signup
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

-- SEED DATA (Optional/Manual)
-- To create the 'adminroot' properly, it should be done via Auth API.
-- Once created, you can promote it to Admin:
-- UPDATE profiles SET role = 'Admin' WHERE email = 'adminroot@securepass.com';
