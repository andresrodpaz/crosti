# Configuración de Email - Resend

Esta guía te ayudará a configurar el sistema de emails de confirmación para Crosti Cookies usando Resend.

## ⚠️ Error 403: Domain Not Verified

Si ves este error en los logs:

```
{"statusCode":403,"message":"The gmail.com domain is not verified. Please, add and verify your domain on https://resend.com/domains","name":"validation_error"}
```

**¿Qué significa?**

- Tu pedido se creó correctamente ✓
- El email de confirmación no se envió ✗
- Resend no puede enviar desde dominios no verificados (como gmail.com)

**Soluciones**:

### Opción A: Modo Desarrollo (Testing Rápido)

Usa el dominio sandbox de Resend y verifica tu email:

1. Cambiar `EMAIL_FROM` en variables de entorno:

   ```env
   EMAIL_FROM=onboarding@resend.dev
   ```

2. Verificar tu email en Resend:
   - Ir a: https://resend.com/emails/verified
   - Add Email
   - Ingresar tu email personal
   - Confirmar en inbox

3. Ahora solo recibirás emails en tu email verificado (ideal para testing)

### Opción B: Producción (Clientes Reales)

Configura tu propio dominio (ej: `crosticookies.com`):

- Ver sección completa abajo: "Opción 2: Dominio Verificado"

---

## ¿Qué es Resend?

Resend es un servicio moderno de email transaccional diseñado para desarrolladores. Es la mejor opción para Next.js porque:

- Integración simple con API REST
- Dashboard limpio para monitorear emails
- Excelente deliverability
- Free tier generoso (3,000 emails/mes)
- Compatible con React Email

## Opciones de Configuración

### Opción 1: Sandbox Mode (Desarrollo)

**Ideal para**: Testing, desarrollo local, demos

**Ventajas**:

- ✓ Setup en 2 minutos
- ✓ Gratis
- ✓ No requiere dominio

**Limitaciones**:

- ✗ Solo puedes enviar a emails verificados
- ✗ No sirve para clientes reales

**Setup**:

1. Crear cuenta en [resend.com](https://resend.com)

2. Obtener API Key:
   - Dashboard > API Keys
   - Create API Key
   - Nombre: "Crosti Development"
   - Copiar: `re_xxxxxxxxxxxxx`

3. Variables de entorno:

   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=onboarding@resend.dev
   ```

4. Verificar tu email:
   - Settings > Verified Emails
   - Add Email
   - Ingresar tu email personal
   - Confirmar en inbox

5. ¡Listo! Ahora los emails de prueba llegarán a tu email

**Cómo probar**:

- Hacer un pedido en `/tienda`
- Usar tu email verificado en el checkout
- Recibirás el email de confirmación

---

### Opción 2: Dominio Verificado (Producción)

**Ideal para**: App en producción con clientes reales

**Requisitos**:

- Dominio propio (ej: `crosticookies.com`)
- Acceso a configuración DNS

**Ventajas**:

- ✓ Envía a cualquier email
- ✓ Emails desde tu dominio (@crosticookies.com)
- ✓ Profesional y confiable

**Setup Paso a Paso**:

#### 1. Tener un Dominio

Opciones para obtener dominio:

**A. Comprar en Vercel** (Más fácil - DNS automático):

- Vercel Dashboard > Tu Proyecto > Settings > Domains
- Buy a domain
- Buscar: `crosticookies.com`
- Precio: ~$15-20/año
- DNS configurado automáticamente ✓

**B. Usar dominio existente**:

- GoDaddy, Namecheap, Google Domains, etc.
- Deberás configurar DNS manualmente

#### 2. Agregar Dominio en Resend

1. Ir a [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Ingresar: `crosticookies.com`
4. Copiar los 3 registros DNS que aparecen

#### 3. Configurar DNS

**Si compraste dominio en Vercel**:

1. Vercel > Settings > Domains > `crosticookies.com` > DNS
2. Agregar estos registros:

```
# SPF
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

# DKIM (copiar el valor específico de tu Resend)
Type: TXT
Name: resend._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3... [tu valor único]

# DMARC
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
```

**Si usas otro proveedor DNS**:

Proceso similar, busca "DNS Management" o "DNS Records" en tu proveedor.

#### 4. Verificar Dominio

1. Esperar 15-30 minutos (propagación DNS)
2. Verificar propagación:
   ```bash
   dig TXT crosticookies.com
   dig TXT resend._domainkey.crosticookies.com
   ```
3. En Resend, click "Verify Domain"
4. Status debe cambiar a: ✓ Verified

#### 5. Actualizar Variables de Entorno

En Vercel (o donde deploys):

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Crosti Cookies <pedidos@crosticookies.com>
```

#### 6. Redeploy

```bash
vercel --prod
# O push a GitHub si tienes auto-deploy
```

---

## Planes y Precios Resend

| Plan       | Precio | Emails/mes | Ideal para                  |
| ---------- | ------ | ---------- | --------------------------- |
| Free       | $0     | 3,000      | Testing, demos, MVPs        |
| Pro        | $20    | 50,000     | Startups, pequeños negocios |
| Enterprise | Custom | Ilimitado  | Gran volumen                |

**Para Crosti**:

- Comienza con **Free** (suficiente para ~100 pedidos/día)
- Actualiza a Pro si necesitas más

---

## Contenido del Email

Los emails de confirmación incluyen:

- ✓ Logo de Crosti
- ✓ Número de pedido
- ✓ Lista de galletas ordenadas
- ✓ Total del pedido
- ✓ Información de entrega (fecha, hora, dirección)
- ✓ Datos de contacto
- ✓ Mensaje de preparación el mismo día

**Plantillas**: Ver `/lib/email-templates.ts`

---

## Testing

### Test Local

```typescript
// app/api/test-email/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: "tu-email@gmail.com",
      subject: "Test desde Crosti",
      html: "<h1>Funciona!</h1>",
    }),
  });

  return NextResponse.json(await res.json());
}
```

Visitar: `http://localhost:3000/api/test-email`

### Test Producción

Hacer un pedido real en `/tienda` y verificar:

- Email llega en < 1 minuto
- Contenido correcto
- No va a spam
- Formato se ve bien

---

## Troubleshooting

### Email no llega

**Check 1: Variables de entorno**

```bash
# En Vercel CLI
vercel env ls

# Debe mostrar:
# RESEND_API_KEY
# EMAIL_FROM
```

**Check 2: Resend Dashboard**

- Ir a: [resend.com/emails](https://resend.com/emails)
- Ver lista de emails enviados
- Status debe ser "Delivered" ✓
- Si es "Bounced" o "Failed", ver error

**Check 3: Carpeta Spam**

- Revisar spam/junk folder
- Si está ahí, marcar "Not Spam"

**Check 4: Logs Vercel**

```bash
vercel logs --follow
# Buscar: "[Message] Email sent successfully"
```

### Error: Domain not verified

**Causa**: DNS no propagado o mal configurado

**Solución**:

```bash
# Verificar DNS
dig TXT crosticookies.com
dig TXT resend._domainkey.crosticookies.com

# Debe mostrar los valores de Resend
# Si no aparece, esperar más tiempo o revisar DNS
```

### Error: Invalid API Key

**Causa**: API Key incorrecta o no configurada

**Solución**:

1. Ir a Resend > API Keys
2. Copiar key correcta
3. En Vercel: Settings > Environment Variables
4. Editar `RESEND_API_KEY`
5. Redeploy

---

## Alternativas a Resend

Si Resend no funciona para ti:

### SendGrid

- Popular, mucha documentación
- Free tier: 100 emails/día
- Setup más complejo

### Postmark

- Excelente deliverability
- Free tier: 100 emails/mes
- Más caro que Resend

### Amazon SES

- Muy barato ($0.10/1000 emails)
- Requiere cuenta AWS
- Setup técnico complejo

**Recomendación**: Quédate con Resend, es la mejor opción para Next.js.

---

## Recursos

- [Resend Docs](https://resend.com/docs)
- [Next.js Email Best Practices](https://resend.com/docs/send-with-nextjs)
- [React Email](https://react.email) - Para mejorar templates

---

**¿Necesitas ayuda?**

- Soporte Resend: support@resend.com
- Revisa `/docs/README.md` para más documentación
