# Guía del Desarrollador - Crosti App

## Índice

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [Scripts SQL](#scripts-sql)
5. [FAQ - Problemas Comunes](#faq---problemas-comunes)
6. [Tareas de Mantenimiento](#tareas-de-mantenimiento)

---

## Introducción

Bienvenido a la guía del desarrollador de Crosti App. Esta documentación cubre todos los aspectos técnicos del sistema, incluyendo problemas comunes y sus soluciones.

### Stack Tecnológico

- **Frontend**: Next.js 16 (App Router), React 19.2, TypeScript
- **Styling**: Tailwind CSS v4
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Sistema custom con bcrypt
- **Deployment**: Vercel

---

## Arquitectura del Sistema

### Estructura de Carpetas

\`\`\`
crosti-app/
├── app/ # Rutas de Next.js
│ ├── admin/ # Panel de administración
│ ├── developer/ # Panel de desarrollador
│ ├── galletas/ # Vista de galletas
│ └── api/ # API routes
├── components/ # Componentes React
│ ├── admin/ # Componentes del admin
│ └── ui/ # Componentes UI base
├── lib/ # Utilidades y configuración
│ └── supabase/ # Clientes de Supabase
├── scripts/ # Scripts SQL para DB
└── docs/ # Documentación
\`\`\`

### Roles de Usuario

- **Admin**: Acceso completo al panel de administración (CRUD de galletas, etiquetas, colores, usuarios)
- **Developer**: Acceso al panel de desarrollador (configuración de landing page)

---

## Base de Datos

### Esquema de Tablas

#### `users`

\`\`\`sql

- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- role (VARCHAR: 'admin', 'developer')
- created_at (TIMESTAMP)
  \`\`\`

#### `cookies`

\`\`\`sql

- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- price (NUMERIC)
- ingredients (TEXT[])
- image_urls (TEXT[])
- main_image_index (INTEGER)
- is_visible (BOOLEAN)
- in_carousel (BOOLEAN)
- carousel_order (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
  \`\`\`

#### `colors`

\`\`\`sql

- id (UUID, PK)
- name (VARCHAR)
- hex (VARCHAR)
- created_at (TIMESTAMP)
  \`\`\`

#### `tags`

\`\`\`sql

- id (UUID, PK)
- name (VARCHAR)
- color_id (UUID, FK -> colors)
- created_at (TIMESTAMP)
  \`\`\`

#### `cookie_tags` (Tabla de relación)

\`\`\`sql

- cookie_id (UUID, FK -> cookies)
- tag_id (UUID, FK -> tags)
- PRIMARY KEY (cookie_id, tag_id)
  \`\`\`

#### `landing_config`

\`\`\`sql

- id (UUID, PK)
- section_name (VARCHAR, UNIQUE)
- title (VARCHAR)
- subtitle (TEXT)
- cta_text (VARCHAR)
- cta_link (VARCHAR)
- image_url (VARCHAR)
- is_visible (BOOLEAN)
- updated_at (TIMESTAMP)
  \`\`\`

### Políticas RLS (Row Level Security)

Las tablas tienen políticas RLS habilitadas:

- **SELECT**: Público (todos pueden leer)
- **INSERT/UPDATE/DELETE**: Solo usuarios con rol 'admin' o 'developer'

---

## Scripts SQL

### Inicialización de la Base de Datos

Los scripts deben ejecutarse en orden:

1. **001_create_tables.sql** - Crea todas las tablas
2. **002_seed_initial_data.sql** - Inserta datos iniciales
3. **003_enable_rls.sql** - Configura políticas de seguridad

### Cómo Ejecutar Scripts

Desde Supabase :

1. Ve a la carpeta `scripts/`
2. Haz clic en cada archivo SQL en orden
3. Ejecuta el script

---

## FAQ - Problemas Comunes

### 🔴 Error: "Could not find the table 'public.cookies' in the schema cache"

**Causa**: La base de datos no ha sido inicializada.

**Solución**:
\`\`\`sql
-- Ejecuta los scripts en orden:
-- 1. scripts/001_create_tables.sql
-- 2. scripts/002_seed_initial_data.sql
-- 3. scripts/003_enable_rls.sql
\`\`\`

---

### 🔴 Error: "SyntaxError: Unexpected token 'R', 'Request En'... is not valid JSON"

**Causa**: El API está devolviendo un error HTML en lugar de JSON.

**Solución**:

1. Verifica que las tablas existan en la base de datos
2. Revisa los logs del servidor para ver el error específico
3. Asegúrate de que las políticas RLS estén configuradas correctamente

---

### 🔴 Error: "Missing closing } at :root"

**Causa**: Error falso generado por el parser CSS de Tailwind v4.

**Solución**: Ignora este error, no afecta la funcionalidad. El CSS está correctamente formado.

---

### 🔴 Error: "No tienes permisos de desarrollador"

**Causa**: El usuario no tiene rol 'developer' o 'admin' en la tabla `users`.

**Solución**:
\`\`\`sql
-- Verifica el rol del usuario
SELECT email, role FROM users WHERE email = 'tu@email.com';

-- Si el usuario no existe o tiene rol incorrecto:
UPDATE users
SET role = 'developer'
WHERE email = 'tu@email.com';

-- Si el usuario no existe, créalo (usa un hash bcrypt real):
INSERT INTO users (email, password_hash, role)
VALUES ('tu@email.com', '$2b$10$...', 'developer');
\`\`\`

---

### 🔴 Error: "invalid input syntax for type uuid"

**Causa**: Se está intentando usar un timestamp o string como UUID.

**Solución**: Asegúrate de que la base de datos genere los UUIDs automáticamente. No incluyas el campo `id` en los INSERT:

\`\`\`sql
-- ❌ INCORRECTO
INSERT INTO cookies (id, name, ...) VALUES ('1234', 'Cookie', ...);

-- ✅ CORRECTO
INSERT INTO cookies (name, ...) VALUES ('Cookie', ...);
\`\`\`

---

### 🔴 Error: "Multiple GoTrueClient instances"

**Causa**: Se están creando múltiples instancias del cliente de Supabase.

**Solución**: Este warning es normal en desarrollo. El código ya usa el patrón singleton correctamente. Puedes ignorarlo.

---

### 🔴 Las imágenes no se muestran

**Causa**:

1. Las URLs de las imágenes no son válidas
2. Las imágenes no están en la carpeta `public/`

**Solución**:
\`\`\`sql
-- Verifica las URLs en la base de datos
SELECT name, image_urls FROM cookies;

-- Actualiza las URLs si es necesario
UPDATE cookies
SET image_urls = ARRAY['/images/cookie1.jpg', '/images/cookie2.jpg']
WHERE id = 'uuid-de-la-cookie';
\`\`\`

---

## Tareas de Mantenimiento

### Cambiar Contraseña de Usuario

**Importante**: Las contraseñas deben estar hasheadas con bcrypt.

\`\`\`sql
-- Primero, genera un hash bcrypt de la nueva contraseña
-- Usa bcrypt.hashSync('nueva_contraseña', 10) en Node.js

-- Luego actualiza la contraseña
UPDATE users
SET password_hash = '$2b$10$...[hash_generado]...'
WHERE email = 'usuario@email.com';
\`\`\`

### Cambiar Rol de Usuario

\`\`\`sql
-- Cambiar a admin
UPDATE users SET role = 'admin' WHERE email = 'usuario@email.com';

-- Cambiar a developer
UPDATE users SET role = 'developer' WHERE email = 'usuario@email.com';
\`\`\`

### Crear Nuevo Usuario

\`\`\`sql
INSERT INTO users (email, password_hash, role)
VALUES (
'nuevo@email.com',
'$2b$10$...[hash_bcrypt_de_la_contraseña]...',
'admin' -- o 'developer'
);
\`\`\`

### Actualizar Orden del Carrusel

\`\`\`sql
-- Mostrar orden actual
SELECT name, carousel_order
FROM cookies
WHERE in_carousel = true
ORDER BY carousel_order;

-- Cambiar orden de una galleta
UPDATE cookies
SET carousel_order = 1
WHERE id = 'uuid-de-la-galleta';
\`\`\`

### Hacer Visible/Invisible una Galleta

\`\`\`sql
-- Hacer visible
UPDATE cookies SET is_visible = true WHERE id = 'uuid';

-- Hacer invisible
UPDATE cookies SET is_visible = false WHERE id = 'uuid';
\`\`\`

### Agregar Galleta al Carrusel

\`\`\`sql
-- Agregar al carrusel en posición 8
UPDATE cookies
SET in_carousel = true, carousel_order = 8
WHERE id = 'uuid';
\`\`\`

### Limpiar Datos de Prueba

\`\`\`sql
-- ⚠️ CUIDADO: Esto eliminará TODOS los datos

-- Eliminar todas las galletas
DELETE FROM cookie_tags;
DELETE FROM cookies;

-- Eliminar todos los tags y colores
DELETE FROM tags;
DELETE FROM colors;

-- Resetear usuarios (mantén admin y developer)
DELETE FROM users WHERE role NOT IN ('admin', 'developer');
\`\`\`

### Backup de la Base de Datos

\`\`\`sql
-- Exportar todas las galletas
SELECT \* FROM cookies ORDER BY created_at;

-- Exportar configuración de landing
SELECT \* FROM landing_config;

-- Exportar usuarios (sin contraseñas)
SELECT id, email, role, created_at FROM users;
\`\`\`

### Restaurar Datos Iniciales

Si necesitas volver a los datos iniciales:

\`\`\`sql
-- Ejecuta de nuevo los scripts:
-- 1. scripts/001_create_tables.sql (DROP TABLE IF EXISTS primero)
-- 2. scripts/002_seed_initial_data.sql
-- 3. scripts/003_enable_rls.sql
\`\`\`

---

## Queries Útiles para Debugging

### Ver Todas las Galletas con sus Tags

\`\`\`sql
SELECT
c.id,
c.name,
c.price,
c.is_visible,
c.in_carousel,
ARRAY_AGG(t.name) as tags
FROM cookies c
LEFT JOIN cookie_tags ct ON c.id = ct.cookie_id
LEFT JOIN tags t ON ct.tag_id = t.id
GROUP BY c.id, c.name, c.price, c.is_visible, c.in_carousel
ORDER BY c.name;
\`\`\`

### Ver Todos los Tags con sus Colores

\`\`\`sql
SELECT
t.name as tag_name,
co.name as color_name,
co.hex as color_hex
FROM tags t
JOIN colors co ON t.color_id = co.id
ORDER BY t.name;
\`\`\`

### Ver Estadísticas de Galletas

\`\`\`sql
SELECT
COUNT(_) as total_cookies,
COUNT(_) FILTER (WHERE is_visible = true) as visible_cookies,
COUNT(\*) FILTER (WHERE in_carousel = true) as carousel_cookies,
ROUND(AVG(price), 2) as avg_price
FROM cookies;
\`\`\`

---

## Contacto y Soporte

Para problemas técnicos o preguntas:

- Email: arodpaz.dev@gmail.com
- Revisa primero esta guía y el FAQ

---

**Última actualización**: Diciembre 2025
