interface EmailData {
  orderId: string
  email: string
  whatsapp: string
  address: string
  deliveryDate: string
  deliveryTime: string
  totalAmount: number
  items: Array<{
    name: string
    quantity: number
    price: number
    subtotal: number
    packCookies?: Array<{ cookieId: string; cookieName: string; quantity: number }> | null
  }>
  name?: string
  note?: string
}

export function generateConfirmationEmailHTML(data: EmailData): string {
  const orderNumber = data.orderId.slice(0, 8).toUpperCase()
  const date = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Colors
  const burgundy = "#930021"
  const cream = "#F8E19A" 
  const bgMain = "#FEFCF5"

  let itemsHTML = ""
  data.items.forEach((item) => {
    itemsHTML += `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong style="color: ${burgundy};">${item.name}</strong>
          ${
            item.packCookies && item.packCookies.length > 0
              ? `<br><small style="color: #6b7280;">Contiene: ${item.packCookies.map((c) => `${c.cookieName} (${c.quantity})`).join(", ")}</small>`
              : ""
          }
        </td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">€${item.price.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: bold;">€${item.subtotal.toFixed(2)}</td>
      </tr>
    `
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${bgMain}; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <tr>
      <td style="background-color: ${burgundy}; padding: 32px 20px; text-align: center;">
        <h1 style="color: ${cream}; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">CROSTI</h1>
        <p style="color: ${cream}; margin: 4px 0 0 0; font-size: 14px; opacity: 0.9; letter-spacing: 2px; text-transform: uppercase;">Cookies</p>
      </td>
    </tr>
    
    <!-- Success Message -->
    <tr>
      <td style="padding: 40px 24px; text-align: center;">
        <div style="display: inline-block; width: 48px; height: 48px; background-color: #d1fae5; border-radius: 50%; margin-bottom: 16px;">
          <span style="color: #059669; font-size: 24px; line-height: 48px;">✓</span>
        </div>
        <h2 style="color: #111827; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">¡Pedido Confirmado!</h2>
        <p style="color: #6b7280; margin: 0; font-size: 16px;">Gracias por tu compra. Estamos preparando tus galletas.</p>
      </td>
    </tr>

    <!-- Order Info Card -->
    <tr>
      <td style="padding: 0 24px;">
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Número de Pedido</p>
          <p style="margin: 0; color: ${burgundy}; font-size: 20px; font-weight: 700; font-family: monospace;">#${orderNumber}</p>
        </div>
      </td>
    </tr>

    <!-- Details Grid -->
    <tr>
      <td style="padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="vertical-align: top; padding-right: 12px;">
              <h3 style="color: #111827; font-size: 14px; font-weight: 700; margin: 0 0 12px 0;">Contacto</h3>
              <p style="margin: 0 0 4px 0; color: #4b5563; font-size: 14px;">${data.email}</p>
              <p style="margin: 0; color: #4b5563; font-size: 14px;">${data.whatsapp}</p>
            </td>
            <td width="50%" style="vertical-align: top; padding-left: 12px;">
              <h3 style="color: #111827; font-size: 14px; font-weight: 700; margin: 0 0 12px 0;">Entrega</h3>
               <p style="margin: 0 0 4px 0; color: #4b5563; font-size: 14px;">📅 ${data.deliveryDate}</p>
               <p style="margin: 0 0 4px 0; color: #4b5563; font-size: 14px;">⏰ ${data.deliveryTime}</p>
               <p style="margin: 0; color: #4b5563; font-size: 14px;">📍 ${data.address}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Items Table -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <h3 style="color: #111827; font-size: 16px; font-weight: 700; margin: 0 0 16px 0; border-bottom: 2px solid ${burgundy}; padding-bottom: 8px;">Detalle del Pedido</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
          <thead>
            <tr style="background-color: #f3f4f6; color: #4b5563;">
              <th style="padding: 8px 12px; text-align: left; font-weight: 600; border-radius: 4px 0 0 4px;">Producto</th>
              <th style="padding: 8px 12px; text-align: center; font-weight: 600;">Cant.</th>
              <th style="padding: 8px 12px; text-align: right; font-weight: 600;">Precio</th>
              <th style="padding: 8px 12px; text-align: right; font-weight: 600; border-radius: 0 4px 4px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 16px 12px; text-align: right; font-size: 16px; font-weight: 700; color: #111827;">Total</td>
              <td style="padding: 16px 12px; text-align: right; font-size: 18px; font-weight: 700; color: ${burgundy};">€${data.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">¿Tienes preguntas? Contáctanos por WhatsApp</p>
        <p style="color: #9ca3af; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Crosti Cookies. Barcelona.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function generateAdminNotificationEmailHTML(data: EmailData): string {
    const orderNumber = data.orderId.slice(0, 8).toUpperCase()
    const burgundy = "#930021"
    const cream = "#F8E19A" 
  
    let itemsHTML = ""
    data.items.forEach((item) => {
      itemsHTML += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name} ${item.packCookies ? '(Pack)' : ''}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">€${item.subtotal.toFixed(2)}</td>
        </tr>
      `
    })
  
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; margin-top: 20px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
      <tr>
        <td style="background-color: ${burgundy}; padding: 16px 24px;">
           <h2 style="color: white; margin: 0; font-size: 18px; font-weight: 600;">🔔 Nuevo Pedido: #${orderNumber}</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px;">
           <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
              <div>
                  <h3 style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Cliente</h3>
                  <p style="margin: 0; font-weight: 600; color: #111827;">${data.name || 'Sin nombre'}</p>
                  <p style="margin: 0; color: #4b5563; font-size: 14px;">${data.email}</p>
                  <p style="margin: 0; color: #4b5563; font-size: 14px;">${data.whatsapp}</p>
              </div>
              <div style="text-align: right;">
                  <h3 style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Total</h3>
                  <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${burgundy};">€${data.totalAmount.toFixed(2)}</p>
              </div>
           </div>
  
           <div style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 12px; margin-bottom: 24px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Entrega:</strong> ${data.deliveryDate} a las ${data.deliveryTime}</p>
              ${data.note ? `<p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px; font-style: italic;">"Note: ${data.note}"</p>` : ''}
              <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">📍 ${data.address}</p>
           </div>
  
           <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
             <thead>
               <tr style="background-color: #f9fafb;">
                 <th style="padding: 8px; text-align: left; color: #6b7280;">Item</th>
                 <th style="padding: 8px; text-align: center; color: #6b7280;">Qty</th>
                 <th style="padding: 8px; text-align: right; color: #6b7280;">Total</th>
               </tr>
             </thead>
             <tbody>
               ${itemsHTML}
             </tbody>
           </table>
           
           <div style="margin-top: 24px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders" style="background-color: #111827; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">Ver en Panel Admin</a>
           </div>
        </td>
      </tr>
    </table>
  </body>
  </html>
    `
  }
  
  export function generateAdminNotificationEmailText(data: EmailData): string {
    return `
  NUEVO PEDIDO RECIBIDO #${data.orderId.slice(0, 8).toUpperCase()}
  
  Cliente: ${data.name}
  Email: ${data.email}
  WhatsApp: ${data.whatsapp}
  
  Total: €${data.totalAmount.toFixed(2)}
  
  Entrega: ${data.deliveryDate} @ ${data.deliveryTime}
  Dirección: ${data.address}
  ${data.note ? `Nota: ${data.note}` : ''}
  
  ITEMS:
  ${data.items.map(i => `- ${i.name} (x${i.quantity})`).join('\n')}
    `
  }


export function generateConfirmationEmailText(data: EmailData): string {
  const orderNumber = data.orderId.slice(0, 8).toUpperCase()

  let itemsText = ""
  data.items.forEach((item) => {
    itemsText += `\n- ${item.name} x${item.quantity} - €${item.subtotal.toFixed(2)}`
    if (item.packCookies && item.packCookies.length > 0) {
      item.packCookies.forEach((cookie) => {
        itemsText += `\n  • ${cookie.cookieName} (${cookie.quantity})`
      })
    }
  })

  return `
CROSTI COOKIES - Confirmación de Pedido

¡Pedido Confirmado!

Número de Pedido: #${orderNumber}

INFORMACIÓN DE CONTACTO
Email: ${data.email}
WhatsApp: ${data.whatsapp}
Dirección: ${data.address}

INFORMACIÓN DE ENTREGA
Fecha: ${data.deliveryDate}
Hora: ${data.deliveryTime}

DETALLE DEL PEDIDO
${itemsText}

TOTAL: €${data.totalAmount.toFixed(2)}

IMPORTANTE: Las galletas se preparan el mismo día de la entrega para garantizar su frescura. Te contactaremos por WhatsApp para confirmar los detalles.

---
Crosti Cookies
Hechas con amor, entregadas con cuidado
  `
}
