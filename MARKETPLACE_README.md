# Crosti Cookies - Marketplace de Pedidos

Este proyecto incluye un sistema completo de marketplace para pedidos programados de galletas sin necesidad de registro de usuario.

## Características

### Sistema de Pedidos

- ✅ Carrito de compras con gestión de cantidades
- ✅ Checkout sin registro de usuario
- ✅ Pedidos programados con fecha y franja horaria
- ✅ Información de contacto: email, WhatsApp y dirección
- ✅ Confirmación de pedido con número de referencia
- ✅ Persistencia del carrito en el navegador

### Base de Datos (Supabase)

- ✅ Tabla `orders` para almacenar pedidos
- ✅ Tabla `order_items` para items de cada pedido
- ✅ Row Level Security (RLS) configurado
- ✅ Políticas de seguridad para acceso público controlado

## Estructura de Rutas

```
/tienda                    → Página principal de la tienda con catálogo
/tienda/checkout           → Página de checkout para finalizar pedido
/tienda/confirmacion       → Página de confirmación después del pedido
```

## Configuración

### 1. Ejecutar el Script SQL

El script SQL ya está incluido en `scripts/001_create_orders_tables.sql`. Se ejecutará automáticamente cuando la app detecte que las tablas no existen.

### 2. Variables de Entorno

Todas las variables de Supabase ya están configuradas automáticamente:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (para operaciones admin)

### 3. Integración de Email (Opcional)

Para enviar correos de confirmación, puedes integrar servicios como:

- **Resend** (recomendado): https://resend.com
- **SendGrid**: https://sendgrid.com
- **Postmark**: https://postmarkapp.com

Edita el archivo `app/api/orders/route.ts` en la función `sendConfirmationEmail()` para agregar tu proveedor de email.

## Flujo del Usuario

1. **Navegar a la Tienda**: El usuario accede a `/tienda`
2. **Agregar al Carrito**: Selecciona galletas y ajusta cantidades
3. **Ir al Checkout**: Click en "Proceder al pago"
4. **Completar Formulario**:
   - Email para confirmación
   - WhatsApp para contacto
   - Dirección de entrega
   - Fecha de entrega (mínimo 24h de anticipación)
   - Franja horaria preferida
5. **Confirmar Pedido**: Se crea el pedido en la base de datos
6. **Página de Confirmación**: Muestra número de pedido y próximos pasos

## Características Técnicas

### Estado del Carrito

- Usa **Zustand** para gestión de estado global
- Persistencia automática en `localStorage`
- Sincronización entre pestañas del navegador

### API Route

- `/api/orders` (POST) - Crea nuevo pedido
- Validación de datos del lado del servidor
- Transacciones atómicas (si falla un item, se revierte todo)
- Manejo de errores robusto

### Seguridad

- Row Level Security (RLS) activado
- Políticas para acceso público controlado
- Validación de inputs en cliente y servidor
- Protección contra SQL injection con consultas parametrizadas

## Personalización

### Franjas Horarias

Edita las opciones en `app/tienda/checkout/page.tsx`:

```typescript
<SelectItem value="09:00-12:00">Mañana (09:00 - 12:00)</SelectItem>
<SelectItem value="12:00-15:00">Mediodía (12:00 - 15:00)</SelectItem>
// Agrega más opciones según necesites
```

### Días Mínimos de Anticipación

En `app/tienda/checkout/page.tsx`, cambia el cálculo de `minDate`:

```typescript
minDate.setDate(minDate.getDate() + 1); // 1 día de anticipación
// Cambia a 2, 3, etc. según tus necesidades
```

### Estados de Pedidos

Los pedidos se crean con estado `pending`. Puedes agregar más estados:

- `confirmed` - Pedido confirmado
- `preparing` - En preparación
- `ready` - Listo para entrega
- `delivered` - Entregado
- `cancelled` - Cancelado

## Próximos Pasos Sugeridos

1. **Panel de Administración**: Crear dashboard para gestionar pedidos
2. **Notificaciones WhatsApp**: Integrar API de WhatsApp Business
3. **Pasarela de Pago**: Integrar Stripe o PayPal
4. **Seguimiento de Pedidos**: Página para rastrear estado del pedido
5. **Sistema de Cupones**: Códigos de descuento y promociones
6. **Gestión de Inventario**: Control de stock disponible

## Soporte

Para cualquier pregunta o problema:

- Revisa la consola del navegador para mensajes de debug `[Message]`
- Verifica que las tablas estén creadas en Supabase
- Asegúrate de que las políticas RLS estén activas
