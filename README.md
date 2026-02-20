# SecurePass Corp - Gestor de Credenciales Corporativo

## 1. Descripción General del Proyecto

**SecurePass Corp** es una aplicación web moderna y segura diseñada para la gestión centralizada de credenciales corporativas. Su objetivo principal es permitir a las organizaciones almacenar, compartir y gestionar el acceso a contraseñas y claves de manera segura y eficiente.

El sistema implementa un estricto control de roles, asegurando que los usuarios solo tengan acceso a la información y funcionalidades permitidas según su perfil (Administrador, Editor o Vizualizador). Además, incorpora medidas de seguridad avanzadas como validación de semillas TOTP (2FA) y encriptación de datos a través de Supabase RLS (Row Level Security).

Está alojado en Vercel y se puede acceder a través del siguiente enlace:

- https://passmanager-amber.vercel.app/

> Las credenciales de acceso están en el documento de la presentación.

## 2. Stack Tecnológico Utilizado

El proyecto ha sido desarrollado utilizando las tecnologías más recientes y robustas del ecosistema React/Next.js:

- **Core Framework**: [Next.js 16.1](https://nextjs.org/) (App Router, Server Components, Server Actions).
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) para tipado estático y robustez.
- **Interfaz de Usuario (UI)**:
  - [React 19](https://react.dev/).
  - [Tailwind CSS v4](https://tailwindcss.com/) para estilos utilitarios.
  - [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) para componentes accesibles y personalizables.
  - [Lucide React](https://lucide.dev/) para iconografía.
- **Backend & Base de Datos**:
  - [Supabase](https://supabase.com/): Base de datos PostgreSQL, Autenticación y Row Level Security (RLS).
- **Gestión de Formularios y Validación**:
  - [React Hook Form](https://react-hook-form.com/).
  - [Zod](https://zod.dev/) para validación de esquemas de datos.
- **Seguridad**:
  - [otplib](https://github.com/yeojz/otplib): Generación y validación de TOTP.
- **Testing**:
  - [Vitest](https://vitest.dev/): Framework de pruebas unitarias.
  - [React Testing Library](https://testing-library.com/): Pruebas de componentes UI.
- **Alojamiento**:
  - [Vercel](https://vercel.com/): Plataforma de alojamiento y despliegue de aplicaciones web.

## 3. Información sobre su Instalación y Ejecución

Siga estos pasos para ejecutar el proyecto en su entorno local:

### Prerrequisitos

- Node.js 18+ instalado.
- Una cuenta y proyecto en Supabase (con las tablas y políticas RLS configuradas).

### Pasos

1.  **Clonar el repositorio**:

    ```bash
    git clone <url-del-repositorio>
    cd passmanagerrepo
    ```

2.  **Instalar dependencias**:

    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**:
    Cree un fichero `.env.local` en la raíz del proyecto y añada sus credenciales de Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
    NEXT_PUBLIC_DEMO_MODE=false
    ```

    Se puede importar la base de datos desde el archivo `supabase_setup.sql` que se encuentra en la raíz del proyecto.

    En el caso de no queres conectarlo a una base de datos y trabajar con datos `demo`, modificar esta variable de entorno a true:

    ```env
    NEXT_PUBLIC_DEMO_MODE=true
    ```

4.  **Ejecutar el servidor de desarrollo**:

    ```bash
    npm run dev
    ```

5.  **Abrir la aplicación**:
    Visite `http://localhost:3000` en su navegador.

6.  **Ejecutar Tests**:
    Para verificar la integridad del código, puede ejecutar la suite de pruebas:
    ```bash
    npm run test
    ```

## 4. Estructura del Proyecto

La estructura de carpetas sigue las convenciones del App Router de Next.js:

- `app/`: Contiene las rutas, páginas y layouts de la aplicación.
  - `auth/`: Acciones de servidor para autenticación.
  - `dashboard/`: Rutas protegidas (Panel principal, Credenciales, Configuración).
  - `login/`: Rutas públicas (Login).
- `components/`: Componentes de UI reutilizables.
  - `credentials/`: Componentes específicos de gestión de credenciales (Tarjetas, Listas, Formularios, Diálogos de compartir).
  - `ui/`: Componentes base de Shadcn (Botones, Inputs, Dialogs).
  - `users/`: Componentes de gestión de usuarios.
- `docs/`: Documentación del proyecto.
  - `00_Initial_Prompt.md`: Prompt inicial para la creación del prompt del proyecto.
  - `01_Technical_Design.md`: Prompt para iniciar el proyecto.
- `lib/`: Utilidades y configuraciones.
  - `mock-data.ts`: Datos de ejemplo para iniciar aplicación sin base de datos.
  - `schemas.ts`: Esquemas de validación Zod.
  - `supabase-admin.ts`: Cliente de Supabase con permisos de administrador.
  - `supabase-client.ts`: Cliente para comunicar los componentes con Supabase.
  - `supabase-server.ts`: Configura la lectura de cookies y crea la conexión de Supabase manteniendo la sesión del usuario.
  - `totp-utils.ts`: Funciones de seguridad TOTP.
  - `utils.ts`: Une dinámicamente las clases de Tailwind (CSS).
- `__tests__/`: Suite de pruebas unitarias.
  - `unit/`: Tests unitarios de componentes, esquemas y lógica de negocio.
- `supabase_setup.sql`: Configuración de la base de datos.

## 5. Funcionalidades Principales

### 🔐 Autenticación y Seguridad

- Login seguro con correo y contraseña.
- Protección de rutas.
- Logout.
- Bloqueo de acceso para usuarios desactivados.

### 🛡️ Roles y Permisos (RBAC)

- **Admin**: Control total. Puede crear/editar/borrar credenciales y gestionar usuarios (altas, desactivar y modificación de roles). No se puede desactivar a sí mismo.
- **Editor**: Puede crear credenciales y editar las que le han sido compartidas. Puede borrar solo sus credenciales. No tiene acceso a la gestión de usuarios.
- **Viewer**: Acceso de solo lectura. Únicamente puede ver y copiar las credenciales compartidas con él. Interfaz simplificada (sin botones de creación/edición).

### 🔑 Gestión de Credenciales

- **CRUD Completo**: Crear, Leer, Actualizar y Eliminar credenciales.
- **Campos Soportados**: Título, Usuario/Email, Contraseña, URL, Descripción y Semilla TOTP.
- **Copiado Rápido**: Botones para copiar usuario y contraseña al portapapeles.
- **Visualización TOTP**: Generación en tiempo real de códigos 2FA si existe una semilla.

### 🤝 Compartición Segura

- Posibilidad de compartir credenciales con otros usuarios del sistema.
- Búsqueda de usuarios por correo electrónico.
- Gestión de accesos: Ver con quién está compartida una credencial y revocar acceso.

### ⚙️ Gestión de Usuarios (Solo Admin)

- Panel de administración para dar de alta nuevos usuarios.
- Asignación de roles (Admin, Editor, Viewer).
- Activación/Desactivación de usuarios.
