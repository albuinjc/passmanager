# DESCRIPCIÓN:

## Necesito un plan de desarrollo que defina una arquitectura completa de una aplicación que quiero crear. El diseño debe ser un fichero MD para que a partir de ahí un agente de IA pueda crear todo el sistema y tenga el contexto sobre: diseño, back, front, autenticación, etc.

## El sistema que quiero crear es un software web para gestionar contraseñas de sitios web, bases de datos, redes sociales, etc... de una compañía. Los usuarios podrán almacenar el nombre de la credencial, la url como link, usuario, contraseña, descripción y almacenar la semilla para 2fa de cada una de las credenciales.

# APP DEFINICIÓN:

## Login y Registro de usuarios.

## Habrá 3 roles de usuarios: Admin, Editor y Lector. Los Admin podrán gestionar todo, los Editores podrán ver sus registros de credenciales y compartirlos con otros usuarios pero no podrán gestionar usuarios. Los Lectores solo podrán ver las credenciales que hayan compartido con ellos.

## Cuando el usuario inicie sesión verá un listado con todas las credenciales que tenga acceso a ver y un buscador para filtrar por nombre. Cada credencial tendrá un botón para copiar el usuario al portapapeles, otro para copiar la contraseña al portapapeles y otro para copiar la semilla al portapapeles. También tendrá un botón para ver el código de verificación 2fa.

## Cada credencial tendrá un botón para editar y otro para eliminar. los Administradores podrán editar y eliminar cualquier credencial. Los Editores solo podrán editar y eliminar sus propias credenciales. Los Lectores no podrán editar ni eliminar ninguna credencial.

## Cada credencial tendrá un botón para compartir con otros usuarios. Los Administradores podrán compartir cualquier credencial con cualquier usuario. Los Editores solo podrán compartir sus propias credenciales con otros usuarios. Los Lectores no podrán compartir ninguna credencial.

## También incluirá el algoritmo para la generación del código de verificación 2fa a partir de una semilla en cada credencial y no depender de software de terceros. El código se regenera cada 30 segundos.

# CARACTERÍSTICAS TÉCNICAS:

## Sistema Control de Versiones (git) y Repositorio (GitHub)

## Tecnologias: Next.js y Tailwind CSS

## Base de datos: Supabase (Postgres). Generar el esquema de las bases de datos SQL tanto para el sistema de usuarios como para los registros de las credenciales y compartición de las mismas. Haz una propuesta inicial de los campos que se deberían contemplar en el modelo de datos.

## Sistema Login.
