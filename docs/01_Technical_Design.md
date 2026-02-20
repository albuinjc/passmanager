# DISEÑO DEL PROYECTO: SecurePass Corp - Sistema de Gestión de Credenciales

Este documento sirve como especificación técnica y guía de implementación para el desarrollo de un gestor de contraseñas corporativo utilizando Next.js ySupabase

---

## 1. ARQUITECTURA TÉCNICA

- **Frontend:** Next.js (App Router), Tailwind CSS, Lucide React (iconos).
- **Backend & Auth:** Supabase (PostgreSQL + Auth).
- **Lógica 2FA:** Librería `otplib` para generación de códigos TOTP (RFC 6238).
- **Control de Versiones:** Git / GitHub.

---

## 2. MODELO DE DATOS (SQL Supabase)

El editor debe ejecutar este script en el SQL Editor de Supabase para configurar la base de datos y la seguridad de nivel de fila (RLS).

```sql
-- Extensiones y Tipos
CREATE TYPE user_role AS ENUM ('Admin', 'Editor', 'Lector');

-- 1. Tabla de Perfiles (Extiende Auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'Lector' NOT NULL,
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
-- Credenciales: Admins ven todo. Editores ven lo propio. Lectores ven lo compartido.
CREATE POLICY "Acceso total para Admins" ON credentials
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Editores gestionan sus credenciales" ON credentials
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Lectores ven credenciales compartidas" ON credentials
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM credential_shares WHERE credential_id = credentials.id AND shared_with = auth.uid()
  ));

```

---

## 3. ESTRUCTURA DE ARCHIVOS

/
├── app/
│ ├── (auth)/ # Login y Registro
│ │ ├── login/page.tsx
│ │ └── register/page.tsx
│ ├── dashboard/ # Panel Principal (Protegido)
│ │ ├── page.tsx # Listado y Buscador
│ │ ├── actions.ts # Server Actions para CRUD
│ │ └── layout.tsx
│ └── api/2fa/generate/route.ts # API para validación si fuera necesaria
├── components/
│ ├── ui/ # Botones, Inputs, Modales (Shadcn)
│ ├── credentials/
│ │ ├── card-credential.tsx # Tarjeta con botones de copiar
│ │ ├── form-credential.tsx # Modal de crear/editar
│ │ ├── share-dialog.tsx # Modal para compartir
│ │ └── totp-viewer.tsx # Lógica de contador 30s y código
├── lib/
│ ├── supabase-client.ts # Cliente de Supabase
│ ├── totp-utils.ts # Implementación de otplib
│ └── utils.ts # Funciones auxiliares
└── middleware.ts # Protección de rutas por sesión

---

## 4. FUNCIONALIDADES CLAVE

### 4.1. Autenticación y Roles (RBAC)

- **Login/Registro:** Sistema estándar de autenticación con email/contraseña.
- **Roles:**
  - **Admin:** Gestión total (CRUD de credenciales, gestión de usuarios).
  - **Editor:** CRUD de sus propias credenciales y compartirlas.
  - **Lector:** Solo lectura de credenciales compartidas.

### 4.2. Gestión de Credenciales

- **CRUD Completo:** Crear, leer, actualizar y eliminar credenciales.
- **Acciones Rápidas:** Botones para copiar al portapapeles (Usuario, Contraseña, Semilla).
- **Visualización 2FA:** Componente que muestra el código de verificación TOTP actual (cambia cada 30s) y la semilla. Se usará otplib para generar el código TOTP a partir de two_fa_seed.Sincronización: El componente TotpViewer usará un hook useEffect con un intervalo de 1 segundo para calcular el tiempo restante ($30 - (currentTime \% 30)$) y refrescar el código automáticamente.

### 4.3. Compartir y Permisos

- **Compartir:** Los usuarios pueden compartir credenciales con otros usuarios.
- **Permisos:** El sistema debe respetar los permisos definidos en las políticas RLS de Supabase.

### 4.4. UI/UX (Tailwind)

- **Buscador:** Funcionalidad de búsqueda en tiempo real sobre el listado de credenciales. Buscador en tiempo real filtrando el array de credenciales.
- Botones de "Copy to Clipboard" usando la API navigator.clipboard.
- Feedback visual (Toasts) al copiar o compartir.

---

## 5. PRÓXIMOS PASOS PARA LA IA

- Usar Clean Architecture para la estructura del proyecto.
- Generar los componentes de la interfaz con Tailwind CSS.
- Implementar los Server Actions para conectar con Supabase.
- Configurar el Middleware para redirigir usuarios según su rol.
- Crear la lógica del TOTP en el cliente para visualización en tiempo real.
- Hacer tests de las funcionalidades implementadas.
