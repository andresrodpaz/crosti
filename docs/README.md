# Documentación Técnica - Crosti Cookies App

## Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Configuración e Instalación](#configuración-e-instalación)
6. [Despliegue en Vercel](#despliegue-en-vercel)
7. [Configuración de Dominio](#configuración-de-dominio)
8. [Base de Datos](#base-de-datos)
9. [Sistema de Email](#sistema-de-email)
10. [Flujo de Pedidos](#flujo-de-pedidos)
11. [Panel de Administración](#panel-de-administración)
12. [Mantenimiento y Troubleshooting](#mantenimiento-y-troubleshooting)

---

## Descripción General

Crosti Cookies es una aplicación web full-stack para venta de galletas artesanales con sistema de pedidos, carrito de compras, gestión de entregas programadas y panel de administración.

### Características Principales

- 🛒 Carrito de compras con persistencia local
- 📅 Sistema de entregas programadas
- 💳 Simulación de pago con tarjeta
- 📧 Confirmaciones por email automáticas
- 👨‍💼 Panel de administración para gestionar pedidos
- 📱 Diseño responsive (mobile-first)
- 🎨 Diseño personalizado con colores de marca Crosti

---

## Arquitectura

### Patrón de Diseño

- **Frontend**: React con Next.js 16 (App Router)
- **Backend**: Next.js API Routes (Serverless)
- **Base de Datos**: PostgreSQL (Supabase/Neon)
- **Estado Global**: Zustand con persistencia
- **Estilo**: Tailwind CSS v4 + shadcn/ui

### Flujo de Datos

```
Usuario → Frontend (React) → API Routes → Base de Datos
                           ↓
                      Email Service (Resend)
```

---

## Stack Tecnológico

### Frontend

- **Next.js 16**: Framework React con SSR/SSG
- **React 19.2**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Tailwind CSS v4**: Framework de estilos
- **shadcn/ui**: Componentes de UI
- **Zustand**: Gestión de estado global
- **Embla Carousel**: Carruseles de imágenes

### Backend

- **Next.js API Routes**: Endpoints serverless
- **PostgreSQL**: Base de datos relacional
- **Supabase/Neon**: Proveedores de base de datos
- **Resend**: Servicio de envío de emails

### Dependencias Principales

```json
{
  "next": "^16.0.0",
  "react": "^19.2.0",
  "tailwindcss": "^4.0.0",
  "@supabase/ssr": "latest",
  "resend": "latest",
  "zustand": "latest"
}
```

---

## Estructura del Proyecto

```
crosti-app-orders/
├── app/                          # App Router de Next.js
│   ├── page.tsx                  # Página principal
│   ├── galletas/                 # Página de galletas
│   ├── tienda/                   # E-commerce
│   │   ├── page.tsx              # Catálogo de productos
│   │   ├── checkout/             # Información de entrega
│   │   ├── pago/                 # Proceso de pago
│   │   └── confirmacion/         # Confirmación de pedido
│   ├── admin/                    # Panel de administración
│   └── api/                      # API Routes
│       └── orders/               # Gestión de pedidos
├── components/                   # Componentes reutilizables
│   ├── ui/                       # Componentes shadcn/ui
│   ├── admin/                    # Componentes de admin
│   ├── crosti-hero.tsx           # Hero principal
│   ├── about-section.tsx         # Sección "sobre nosotros"
│   ├── cookies-section.tsx       # Carrusel de galletas
│   └── footer.tsx                # Footer
├── lib/                          # Utilidades y configuración
│   ├── cart-store.ts             # Store del carrito (Zustand)
│   ├── email-templates.ts        # Plantillas de email
│   └── types/                    # Tipos TypeScript
├── public/                       # Archivos estáticos
│   └── images/                   # Imágenes
├── scripts/                      # Scripts de base de datos
│   └── 001_create_orders_tables.sql
├── docs/                         # Documentación
└── next.config.mjs               # Configuración Next.js
```

---

## Configuración e Instalación

### Requisitos Previos

- Node.js 18.x o superior
- npm, yarn o pnpm
- Cuenta en Vercel
- Cuenta en Supabase o Neon
- Cuenta en Resend

### Instalación Local

1. **Clonar el repositorio**

```bash
git clone <tu-repositorio>
cd crosti-app-orders
```

2. **Instalar dependencias**

```bash
npm install
# o
pnpm install
```

3. **Configurar variables de entorno**

Crear archivo `.env.local` en la raíz:

```env
# Base de Datos (Supabase)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# O Base de Datos (Neon)
DATABASE_URL=postgresql://usuario:password@host/database

# Email
RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_FROM=pedidos@crosti.com

# Otros
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

4. **Configurar base de datos**

Ejecutar el script SQL en tu base de datos:

```bash
# En Supabase SQL Editor o Neon Console
# Ejecutar: scripts/001_create_orders_tables.sql
```

5. **Ejecutar en desarrollo**

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Despliegue en Vercel

### Paso 1: Preparación

1. **Crear cuenta en Vercel**
   - Ir a [vercel.com](https://vercel.com)
   - Registrarse con GitHub, GitLab o Bitbucket

2. **Subir código a repositorio Git**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-repositorio-url>
git push -u origin main
```

### Paso 2: Importar Proyecto

1. En el dashboard de Vercel, clic en **"Add New Project"**
2. Seleccionar el repositorio de GitHub
3. Configurar el proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (por defecto)
   - **Output Directory**: .next (por defecto)

### Paso 3: Variables de Entorno

En la sección **"Environment Variables"** agregar todas las variables necesarias:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=pedidos@tudominio.com
```

**Importante**:

- Las variables con prefijo `NEXT_PUBLIC_` son visibles en el cliente
- Las demás solo están disponibles en el servidor

### Paso 4: Deploy

1. Clic en **"Deploy"**
2. Esperar a que termine el build (2-5 minutos)
3. Tu app estará disponible en `https://tu-proyecto.vercel.app`

### Redeploys Automáticos

Cada push a la rama `main` desplegará automáticamente:

```bash
git add .
git commit -m "Actualización"
git push origin main
```

---

## Configuración de Dominio

### Opción 1: Dominio Nuevo desde Vercel

1. En el proyecto de Vercel, ir a **Settings > Domains**
2. Clic en **"Buy a domain"**
3. Buscar y comprar tu dominio (ej: `crosti.com`)
4. La configuración DNS se hace automáticamente
5. Tu sitio estará en `https://crosti.com` en minutos

### Opción 2: Dominio Existente

Si ya tienes un dominio en otro registrar (GoDaddy, Namecheap, etc.):

1. **Agregar dominio en Vercel**
   - Settings > Domains > **Add**
   - Escribir tu dominio: `crosti.com`
   - Agregar también `www.crosti.com` si deseas

2. **Configurar DNS en tu registrar**

   Vercel te mostrará los registros DNS necesarios:

   **Opción A: CNAME (Recomendado)**

   ```
   Tipo: CNAME
   Nombre: www
   Valor: cname.vercel-dns.com
   ```

   **Opción B: A Record (para dominio raíz)**

   ```
   Tipo: A
   Nombre: @
   Valor: 76.76.21.21
   ```

3. **Esperar propagación DNS**
   - Puede tomar de 30 minutos a 48 horas
   - Verificar con: `nslookup crosti.com`

4. **Certificado SSL**
   - Vercel configura HTTPS automáticamente
   - No requiere configuración adicional

### Configurar Subdominio (opcional)

Para `tienda.crosti.com`:

```
Tipo: CNAME
Nombre: tienda
Valor: cname.vercel-dns.com
```

---

## Base de Datos

### Esquema de Tablas

#### Tabla: `orders`

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabla: `order_items`

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  cookie_id TEXT NOT NULL,
  cookie_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Políticas de Seguridad (RLS)

Las tablas tienen Row Level Security habilitado con políticas que permiten:

- Crear pedidos sin autenticación (para clientes)
- Leer pedidos propios
- Actualizar estado (para admin)

### Backup y Mantenimiento

**Supabase**:

- Backups automáticos diarios
- Acceso desde Dashboard > Database > Backups

**Neon**:

- Backups automáticos configurables
- Branch database para testing

---

## Sistema de Email

### Configuración de Resend

1. **Crear cuenta**: [resend.com](https://resend.com)

2. **Obtener API Key**:
   - Dashboard > API Keys > Create API Key
   - Copiar y guardar en variables de entorno

3. **Verificar dominio** (opcional pero recomendado):
   - Settings > Domains > Add Domain
   - Agregar registros DNS proporcionados
   - Emails se enviarán desde `pedidos@tudominio.com`

### Plantillas de Email

Las plantillas están en `lib/email-templates.ts`:

- **HTML Template**: Email con diseño completo
  - Header con logo y degradado Crosti
  - Detalles del pedido en tabla
  - Información de entrega
  - Footer con contacto

- **Text Template**: Versión texto plano para clientes sin HTML

### Personalización

Editar `lib/email-templates.ts` para cambiar:

- Colores de marca
- Logo
- Texto y mensajes
- Información de contacto

---

## Flujo de Pedidos

### 1. Usuario Agrega Productos al Carrito

```typescript
// En componente de producto
const { addItem } = useCartStore();
addItem({
  id: cookie.id,
  name: cookie.name,
  price: cookie.price,
  imageUrl: cookie.imageUrl,
});
```

### 2. Checkout - Información de Entrega

- `/tienda/checkout`
- Formulario con: nombre, email, WhatsApp, dirección, fecha y hora
- Datos se pasan como URL params a página de pago

### 3. Pago

- `/tienda/pago`
- Simulación de pago con tarjeta
- Validación de campos
- Creación de pedido en base de datos

### 4. Confirmación

- `/tienda/confirmacion`
- Muestra detalles del pedido
- Email enviado automáticamente
- Carrito limpiado

### Diagrama de Flujo

```
Tienda → Agregar al Carrito → Checkout → Pago → Confirmación
                ↓                               ↓
         LocalStorage                    Base de Datos
                                              ↓
                                         Email Cliente
```

---

## Panel de Administración

### Acceso

- URL: `/admin`
- **Sin autenticación actualmente** (agregar autenticación en producción)

### Funcionalidades

#### 1. Vista de Pedidos

- Lista completa de pedidos
- Información principal visible
- Búsqueda por número de pedido, email o teléfono

#### 2. Detalles Expandibles

- Clic en pedido para ver todos los detalles:
  - Productos ordenados
  - Dirección completa
  - Notas especiales
  - Hora de creación

#### 3. Gestión de Estado

Estados disponibles:

- `pending`: Pendiente
- `confirmed`: Confirmado
- `in_progress`: En preparación
- `delivered`: Entregado
- `cancelled`: Cancelado

#### 4. Buscar Pedidos

```typescript
// Búsqueda por múltiples campos
const filteredOrders = orders.filter(
  (order) =>
    order.id.includes(searchTerm) ||
    order.email.includes(searchTerm) ||
    order.whatsapp.includes(searchTerm),
);
```

### Mejoras Futuras Recomendadas

- [ ] Autenticación y autorización
- [ ] Exportar pedidos a CSV
- [ ] Filtros por fecha y estado
- [ ] Notificaciones en tiempo real
- [ ] Dashboard con métricas

---

## Mantenimiento y Troubleshooting

### Problemas Comunes

#### 1. "Carrito Vacío" después del pago

**Causa**: Cart se limpia antes de navegar a confirmación
**Solución**: Ya implementada usando localStorage temporal

#### 2. Emails no se envían

**Verificar**:

- Variable `RESEND_API_KEY` configurada correctamente
- Variable `EMAIL_FROM` con email verificado en Resend
- Revisar logs en Vercel: Functions > [tu-funcion] > Logs

#### 3. Errores de base de datos

**Verificar**:

- Tablas creadas correctamente
- RLS policies configuradas
- Variables de conexión correctas
- Conexión en Vercel: Settings > Data

#### 4. Imágenes no cargan

**Verificar**:

- Imágenes en carpeta `public/images/`
- Rutas comienzan con `/images/nombre.jpg`
- Optimización Next.js activada

### Logs y Debugging

#### Vercel Logs

```bash
# Instalar Vercel CLI
npm i -g vercel

# Ver logs en tiempo real
vercel logs [tu-proyecto] --follow
```

#### Console Logs

```typescript
// Agregar logs temporales
console.log("[Message] Variable:", miVariable);
```

#### Base de Datos

```sql
-- Ver últimos pedidos
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Ver pedidos pendientes
SELECT * FROM orders WHERE status = 'pending';
```

### Monitoreo

#### Vercel Analytics

- Activar en: Settings > Analytics
- Ver tráfico, tiempo de carga, errores

#### Supabase Dashboard

- Ver queries ejecutadas
- Monitor de rendimiento
- Logs de errores

### Actualización de Dependencias

```bash
# Ver paquetes desactualizados
npm outdated

# Actualizar todos
npm update

# Actualizar Next.js
npm install next@latest react@latest react-dom@latest
```

### Backup Regular

1. **Código**: Siempre en Git
2. **Base de datos**: Backup automático en Supabase/Neon
3. **Variables de entorno**: Documentar en lugar seguro

---

## Recursos Adicionales

### Documentación Oficial

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Comunidad y Soporte

- [Next.js Discord](https://nextjs.org/discord)
- [Vercel Community](https://vercel.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

### Contacto Técnico

Para soporte adicional con esta aplicación, contactar al desarrollador del proyecto.

---

**Última actualización**: Enero 2026
**Versión**: 1.0.0
