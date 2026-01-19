# Credenciales del Sistema Crosti Cookies

## Usuarios por Defecto

### Administrador
- **Email:** `admin@crosti.com`
- **Contraseña:** `password123` (cambiar después del primer login)
- **Rol:** `admin`
- **Permisos:** 
  - Gestión completa de galletas (crear, editar, eliminar)
  - Gestión de colores y etiquetas
  - Gestión de usuarios
  - Configuración del landing page

### Desarrollador
- **Email:** `arodpaz.dev@gmail.com`
- **Contraseña:** `password123` (cambiar después del primer login)
- **Rol:** `developer`
- **Permisos:**
  - Todos los permisos de administrador
  - Acceso a documentación técnica
  - Acceso a FAQ de problemas técnicos
  - Ejecución de scripts SQL

## URLs de Acceso

### Panel de Administrador
`/admin/login` → Acceso con credenciales de admin

### Panel de Desarrollador
`/developer/login` → Acceso con credenciales de developer

## Cambiar Contraseñas

### Método 1: SQL Directo (Recomendado)
\`\`\`sql
-- Generar hash de nueva contraseña (usa bcrypt en tu entorno local)
-- Ejemplo con bcryptjs en Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('nueva_contraseña', 10);

-- Actualizar contraseña en la base de datos
UPDATE users 
SET password_hash = '$2a$10$TU_HASH_AQUI'
WHERE email = 'admin@crosti.com';
\`\`\`

### Método 2: Crear API de Cambio de Contraseña
Crear un endpoint protegido para cambiar contraseñas desde el panel.

## Variables de Entorno

Las siguientes variables de entorno están configuradas automáticamente:

### Supabase
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Neon (PostgreSQL)
- `DATABASE_URL`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

## Seguridad

### Mejores Prácticas

1. **Cambiar contraseñas por defecto inmediatamente**
2. **Nunca compartir las credenciales de developer**
3. **Usar contraseñas fuertes (mínimo 12 caracteres)**
4. **Habilitar autenticación de dos factores cuando sea posible**
5. **Revisar logs de acceso regularmente**

### Hashes de Contraseña

El sistema usa **bcrypt** con factor de coste 10 para hashear contraseñas.

\`\`\`javascript
// Ejemplo de cómo hashear una contraseña
const bcrypt = require('bcryptjs');
const password = 'mi_contraseña_segura';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
\`\`\`

## Recuperación de Acceso

Si pierdes acceso a las cuentas:

1. **Acceso directo a la base de datos:** Usa Supabase Dashboard o herramientas SQL
2. **Crear nuevo admin temporalmente:**
\`\`\`sql
INSERT INTO users (username, email, password_hash, role) 
VALUES ('temp_admin', 'temp@crosti.com', '$2a$10$...', 'admin');
\`\`\`
3. **Contactar soporte de Vercel/Supabase** si es necesario

## Notas Importantes

- Las contraseñas por defecto (`password123`) son **temporales y NO seguras**
- Cambiar todas las contraseñas antes de ir a producción
- Los hashes de contraseña en los scripts SQL son placeholders
- No almacenar contraseñas en texto plano nunca
