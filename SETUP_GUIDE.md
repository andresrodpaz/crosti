# Guía de Configuración - Crosti App

## Estado Actual del Sistema

### ✅ Correcciones Completadas

1. **Sistema de Autenticación**
   - Login ahora usa Supabase Auth (`auth.signInWithPassword`)
   - Cambio de contraseña usa `auth.admin.updateUserById`
   - Eliminada dependencia de tabla `users` inexistente
   - Sistema 100% compatible con Supabase Auth + tabla `profiles`

2. **Toggle de Galletas**
   - Ocultar/mostrar galletas: ✅ Implementado correctamente
   - Agregar/quitar del carrusel: ✅ Implementado correctamente
   - Confirmaciones visuales: ✅ Toasts en todas las acciones

### ⚠️ Problema Principal

**Tu base de datos está vacía (0 tablas).** Todos los errores que experimentas se deben a esto.

---

## 🚀 Pasos para Configurar la Base de Datos

### Paso 1: Ejecutar el Script de Setup Completo

Ejecuta el siguiente script en Supabase para crear todas las tablas:

```
scripts/001_complete_database_setup.sql
```

Este script crea:

- ✅ Tabla `profiles` (usuarios con roles)
- ✅ Tabla `cookies` (catálogo de galletas)
- ✅ Tabla `colors` (colores para etiquetas)
- ✅ Tabla `tags` (etiquetas de galletas)
- ✅ Tabla `cookie_tags` (relación galletas-etiquetas)
- ✅ Tabla `landing_config` (configuración del hero)
- ✅ Políticas RLS (seguridad)
- ✅ Datos iniciales (colores y etiquetas por defecto)

### Paso 2: Crear el Usuario Admin

Después de crear las tablas, necesitas crear tu primer usuario admin. Tienes 2 opciones:

**Opción A: Usar el Endpoint de Setup (Recomendado)**

1. Asegúrate de tener la variable de entorno `ADMIN_SETUP_TOKEN` configurada
2. Ejecuta una petición POST a `/api/setup-admin` con el header:
   ```
   Authorization: Bearer TU_ADMIN_SETUP_TOKEN
   ```

Esto creará:

- Email: `admin@crosti.com`
- Contraseña: `crosti2025`
- Rol: `admin`

**Opción B: Registrar Manualmente en Supabase**

1. Ve a tu proyecto de Supabase
2. Authentication → Users → Add User
3. Crea el usuario con email y contraseña
4. Copia el UUID del usuario creado
5. Ejecuta este SQL en Supabase:

```sql
INSERT INTO profiles (id, email, name, role)
VALUES ('UUID_DEL_USUARIO', 'admin@crosti.com', 'Admin', 'admin');
```

### Paso 3: Probar el Login

1. Ve a `/admin/login`
2. Usa las credenciales:
   - Email: `admin@crosti.com`
   - Contraseña: `crosti2025`
3. Deberías poder acceder al panel admin

---

## 🔧 Funcionalidades del Panel Admin

### Panel de Galletas

**Acciones disponibles:**

- ➕ Crear nueva galleta
- ✏️ Editar galleta existente (con confirmación)
- 🗑️ Eliminar galleta (con confirmación)
- 👁️ Ver detalles completos
- 👁️/👁️‍🗨️ Ocultar/mostrar en web
- ⭐ Agregar/quitar del carrusel (máximo 8)
- 🔍 Buscar y filtrar
- 📥 Exportar a CSV

**Todas las acciones muestran:**

- ✅ Confirmaciones visuales (toasts)
- ✅ Modales de confirmación para acciones críticas
- ✅ Actualización inmediata en la interfaz

### Panel de Usuarios

**Acciones disponibles:**

- ✏️ Editar rol de usuario (con confirmación)
- 🔑 Cambiar contraseña (usa Supabase Auth)
- 🗑️ Eliminar usuario (con confirmación)

**Roles disponibles:**

- 🛡️ Admin: Acceso completo
- 🔧 Developer: Acceso completo + panel developer
- ✏️ Editor: Puede editar contenido
- 👁️ Viewer: Solo lectura

### Panel Developer (Solo rol developer)

**Para otorgar rol developer:**

1. Primero debes tener un usuario en la base de datos
2. Inicia sesión como admin
3. Ve a Usuarios → Editar usuario
4. Cambia el rol a "Desarrollador"
5. El usuario podrá acceder a `/developer/login`

---

## 🐛 Solución de Problemas Comunes

### Error: "Could not find the table 'public.users'"

**Causa:** La base de datos está vacía
**Solución:** Ejecuta `scripts/001_complete_database_setup.sql`

### Error: "Credenciales incorrectas" después de cambiar contraseña

**Causa:** Sistema ahora usa Supabase Auth correctamente
**Solución:** Las contraseñas ahora se actualizan en Supabase Auth y funcionan al instante

### Error: "User not allowed" al cambiar contraseña

**Causa:** Ya corregido - usaba método incorrecto
**Solución:** El código ahora usa `auth.admin.updateUserById`

### Los toggles de visibilidad/carrusel no funcionan

**Causa:** Base de datos vacía o sin tabla `cookies`
**Solución:** Ejecuta el script de setup completo

---

## 📋 Checklist de Verificación

Antes de reportar problemas, verifica:

- [ ] ¿Ejecutaste `scripts/001_complete_database_setup.sql`?
- [ ] ¿Existe la tabla `profiles` en tu base de datos?
- [ ] ¿Existe la tabla `cookies` en tu base de datos?
- [ ] ¿Creaste al menos un usuario admin?
- [ ] ¿Puedes hacer login en `/admin/login`?
- [ ] ¿Las variables de entorno de Supabase están configuradas?

---

## 🎯 Próximos Pasos

Una vez que la base de datos esté configurada:

1. ✅ Login funcionará correctamente
2. ✅ Cambio de contraseñas funcionará
3. ✅ Toggles de galletas funcionarán
4. ✅ Todas las confirmaciones visuales aparecerán
5. ✅ El panel developer estará disponible para usuarios developer

---

## 📝 Notas Importantes

1. **No uses `scripts/001_create_tables.sql`** - Este script es obsoleto y crea una tabla `users` incorrecta
2. **Usa solo `scripts/001_complete_database_setup.sql`** - Este es el correcto
3. **Supabase Auth maneja las contraseñas** - No se almacenan en tablas personalizadas
4. **La tabla `profiles` referencia `auth.users`** - Es la forma correcta de extender Supabase Auth

---

## 🆘 Soporte

Si después de seguir estos pasos aún tienes problemas:

1. Verifica que la base de datos tenga las tablas creadas
2. Revisa los logs del navegador (F12 → Console) para errores específicos
3. Verifica que las variables de entorno estén correctamente configuradas
