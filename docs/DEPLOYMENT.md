# Guía de Despliegue - Crosti Cookies

## Checklist Pre-Despliegue

Antes de desplegar a producción, verificar:

- [ ] Código subido a Git (GitHub, GitLab, etc.)
- [ ] Variables de entorno documentadas
- [ ] Base de datos configurada (Supabase/Neon)
- [ ] Resend API Key obtenida
- [ ] Dominio registrado (opcional)
- [ ] Email de remitente verificado

---

## Despliegue Paso a Paso

### 1. Preparar Base de Datos

#### Opción A: Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a SQL Editor
3. Ejecutar script:
```sql
-- Copiar todo el contenido de scripts/001_create_orders_tables.sql
```
4. Obtener credenciales:
   - Settings > API
   - Copiar: `URL` y `anon public`

#### Opción B: Neon

1. Crear proyecto en [neon.tech](https://neon.tech)
2. Copiar connection string
3. Ejecutar script en SQL Editor o con herramienta CLI

### 2. Configurar Email (Resend)

1. Registrarse en [resend.com](https://resend.com)

2. **Opción A: Modo Sandbox (Testing/Desarrollo)**
   - API Keys > Create API Key
   - Copiar: `re_xxxxx`
   - En modo sandbox, solo puedes enviar emails a:
     - Tu email verificado en Resend
     - Direcciones que agregues en "Verified Emails"
   - **Limitación**: No puedes enviar a clientes reales todavía
   
3. **Opción B: Verificar Dominio Propio (Producción)**
   
   **Paso 1: Agregar Dominio**
   - Ir a Domains > Add Domain
   - Ingresar tu dominio: `crosticookies.com`
   
   **Paso 2: Configurar DNS**
   
   En tu proveedor de DNS (Vercel, GoDaddy, Cloudflare, etc.), agregar estos registros:
   
   ```dns
   # SPF Record
   Tipo: TXT
   Nombre: @
   Valor: v=spf1 include:_spf.resend.com ~all
   TTL: 3600
   
   # DKIM Record (valores específicos de tu cuenta Resend)
   Tipo: TXT
   Nombre: resend._domainkey
   Valor: [copiar de Resend dashboard]
   TTL: 3600
   
   # DMARC Record
   Tipo: TXT
   Nombre: _dmarc
   Valor: v=DMARC1; p=none;
   TTL: 3600
   ```
   
   **Paso 3: Verificar**
   - Esperar 15-30 minutos para propagación DNS
   - En Resend, click "Verify Domain"
   - Estado debe cambiar a "Verified" ✓
   
4. **Configurar Variables de Entorno**:

   ```env
   # Resend API Key (igual para sandbox o producción)
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   
   # Modo Sandbox (testing):
   EMAIL_FROM=onboarding@resend.dev
   
   # Modo Producción (dominio verificado):
   EMAIL_FROM=pedidos@crosticookies.com
   # O cualquier alias de tu dominio:
   # EMAIL_FROM=Crosti Cookies <pedidos@crosticookies.com>
   ```

5. **Probar Envío**:

   En modo sandbox:
   ```bash
   # Solo funcionará si tu-email@gmail.com está verificado en Resend
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_xxxxx" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "tu-email@gmail.com",
       "subject": "Test",
       "html": "<p>Funciona!</p>"
     }'
   ```

**Importante sobre Resend:**

- **Sandbox (gratis)**: 100 emails/día a emails verificados
- **Producción (pago)**: Con dominio verificado, envías a cualquier email
- **Planes**: 
  - Free: $0/mes - 3,000 emails/mes
  - Pro: $20/mes - 50,000 emails/mes
- **Sin dominio propio**: No podrás enviar emails de confirmación a clientes reales

### 3. Desplegar en Vercel

#### Por Terminal

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Seguir prompts:
# - Set up and deploy: Y
# - Scope: tu-usuario
# - Link to existing project: N
# - Project name: crosti-app-orders
# - Directory: ./
# - Override settings: N

# Agregar variables de entorno
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM

# Deploy a producción
vercel --prod
```

#### Por Dashboard Web

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Importar repositorio Git
3. Configurar proyecto:
   - Framework: Next.js
   - Root: ./
4. Agregar Environment Variables:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=pedidos@crosti.com
```

5. Deploy!

### 4. Verificar Despliegue

#### Tests Básicos

1. **Homepage**: `https://tu-proyecto.vercel.app`
   - [ ] Logo carga correctamente
   - [ ] Navegación funciona
   - [ ] Secciones visibles

2. **Tienda**: `/tienda`
   - [ ] Productos se muestran
   - [ ] Agregar al carrito funciona
   - [ ] Modal de detalles abre

3. **Checkout**: `/tienda/checkout`
   - [ ] Formulario visible
   - [ ] Validación funciona
   - [ ] Date picker funciona

4. **Hacer pedido de prueba**:
   - Agregar productos
   - Completar checkout
   - Simular pago
   - Verificar email recibido
   - Verificar en admin

5. **Admin**: `/admin`
   - [ ] Pedidos aparecen
   - [ ] Búsqueda funciona
   - [ ] Cambiar estado funciona

#### Verificar Logs

```bash
# Ver logs en tiempo real
vercel logs --follow

# O en dashboard:
# Vercel > Tu Proyecto > Deployments > [último] > Function Logs
```

### 5. Configurar Dominio Personalizado

#### Comprar Dominio en Vercel

1. Settings > Domains
2. Buy a domain
3. Buscar `crosti.com` (o el que prefieras)
4. Completar compra
5. ¡Listo! DNS configurado automáticamente

#### Usar Dominio Existente

1. **En Vercel**: Settings > Domains > Add
   - Agregar: `crosti.com` y `www.crosti.com`

2. **En tu registrar DNS**:

   Para dominio raíz (`crosti.com`):
   ```
   Tipo: A
   Nombre: @
   Valor: 76.76.21.21
   TTL: 3600
   ```

   Para www:
   ```
   Tipo: CNAME
   Nombre: www
   Valor: cname.vercel-dns.com
   TTL: 3600
   ```

3. **Esperar propagación**: 30 min - 48 horas

4. **Verificar**:
   ```bash
   nslookup crosti.com
   # Debe mostrar: 76.76.21.21
   ```

5. **SSL**: Vercel lo configura automáticamente

---

## Post-Despliegue

### Actualizar Email FROM

Si configuraste dominio personalizado:

1. En Resend: verificar dominio nuevo
2. En Vercel variables de entorno:
   ```env
   EMAIL_FROM=pedidos@crosti.com
   ```
3. Redeploy para aplicar cambios

### Habilitar Analytics

1. Vercel > Settings > Analytics > Enable
2. Ver métricas de tráfico, performance, etc.

### Configurar Notificaciones

1. Settings > Notifications
2. Agregar email o Slack para:
   - Deployment success/fail
   - Performance issues
   - Errors

### Proteger Admin

**Importante**: Actualmente `/admin` no tiene autenticación.

Opciones para proteger:

#### Opción 1: Middleware Simple
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')
    
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }
  
  return NextResponse.next()
}
```

#### Opción 2: Auth con NextAuth.js

Revisar documentación en `/docs/AUTHENTICATION.md` (próximamente)

---

## Troubleshooting Despliegue

### Build Falla

**Error**: `Module not found: Can't resolve 'X'`

**Solución**:
```bash
# Verificar que esté en package.json
npm install X --save
git add package.json package-lock.json
git commit -m "Add dependency"
git push
```

### Variables de Entorno No Funcionan

**Verificar**:
1. Variables agregadas en Vercel Dashboard
2. Nombres correctos (sin espacios)
3. Variables `NEXT_PUBLIC_*` para cliente
4. Redeploy después de agregar variables

### Base de Datos Connection Error

**Verificar**:
1. IP de Vercel permitida en Supabase/Neon
2. Connection string correcta
3. Tablas creadas
4. Policies RLS configuradas

### 404 en Rutas

**Verificar**:
1. Archivos `page.tsx` existen
2. Estructura de carpetas correcta en `app/`
3. Build completó sin errores

### Emails No Se Envían

**Error**: `The gmail.com domain is not verified`

**Causa**: Intentas enviar desde un dominio (@gmail.com) no verificado en Resend.

**Soluciones**:

1. **Desarrollo/Testing (Sandbox Mode)**:
   ```env
   EMAIL_FROM=onboarding@resend.dev
   ```
   Verifica tu email personal en Resend:
   - Ir a: Settings > Verified Emails
   - Add Email > Ingresar tu email
   - Confirmar en bandeja de entrada
   - Ahora los emails llegarán a ese email

2. **Producción (Dominio Propio)**:
   - Comprar/tener dominio propio
   - Verificar dominio en Resend (ver sección 2)
   - Configurar DNS correctamente
   - Actualizar `EMAIL_FROM`:
     ```env
     EMAIL_FROM=pedidos@tudominio.com
     ```

3. **Alternativa sin dominio**:
   - La app funciona perfectamente sin emails
   - Los pedidos se guardan en la base de datos
   - Puedes ver todos los pedidos en `/admin`
   - Comunica pedidos manualmente por WhatsApp

**Verificar Logs de Resend**:
- Ir a [resend.com/emails](https://resend.com/emails)
- Ver status de cada email enviado
- Revisar errores específicos

---

## Mantenimiento

### Actualizar Código

```bash
# Hacer cambios
git add .
git commit -m "Descripción de cambios"
git push

# Vercel deploy automático en segundos
```

### Rollback

Si algo sale mal:

1. Ir a Vercel > Deployments
2. Encontrar deployment anterior funcional
3. Clic en "..." > Promote to Production

### Monitoreo Regular

- [ ] Verificar emails se envían (revisar Resend logs)
- [ ] Revisar pedidos en admin
- [ ] Verificar errores en Vercel logs
- [ ] Revisar métricas de analytics

---

## Recursos

- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

**¡Tu app está lista para producción!** 🎉
