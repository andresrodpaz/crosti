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

  let itemsHTML = ""
  data.items.forEach((item) => {
    itemsHTML += `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f5e6d3;">
          <strong>${item.name}</strong>
          ${
            item.packCookies && item.packCookies.length > 0
              ? `<br><small style="color: #924C14;">Contiene: ${item.packCookies.map((c) => `${c.cookieName} (${c.quantity})`).join(", ")}</small>`
              : ""
          }
        </td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f5e6d3;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f5e6d3;">€${item.price.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f5e6d3; font-weight: bold;">€${item.subtotal.toFixed(2)}</td>
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
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #fef9f3;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #930021 0%, #b8002e 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #F8E19A; margin: 0; font-size: 32px; font-weight: bold;">CROSTI</h1>
        <p style="color: #F8E19A; margin: 5px 0 0 0; font-size: 16px;">cookies</p>
      </td>
    </tr>
    
    <!-- Success Message -->
    <tr>
      <td style="padding: 40px 20px; text-align: center; background-color: #f5efe5;">
        <div style="display: inline-block; width: 60px; height: 60px; background-color: #4ade80; border-radius: 50%; margin-bottom: 20px;">
          <span style="color: white; font-size: 30px; line-height: 60px;">✓</span>
        </div>
        <h2 style="color: #930021; margin: 0; font-size: 28px;">¡Pedido Confirmado!</h2>
        <p style="color: #924C14; margin: 10px 0 0 0; font-size: 16px;">Gracias por tu compra</p>
      </td>
    </tr>

    <!-- Order Info -->
    <tr>
      <td style="padding: 30px 20px;">
        <div style="background-color: #fef9f3; border: 2px solid #F8E19A; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #924C14;"><strong>Número de Pedido:</strong></p>
          <p style="margin: 0; color: #930021; font-size: 18px; font-weight: bold; font-family: monospace;">#${orderNumber}</p>
        </div>

        <table width="100%" cellpadding="8" style="margin-bottom: 20px;">
          <tr>
            <td style="color: #924C14; padding-bottom: 5px;"><strong>📧 Email:</strong></td>
            <td style="color: #930021; padding-bottom: 5px;">${data.email}</td>
          </tr>
          <tr>
            <td style="color: #924C14; padding-bottom: 5px;"><strong>📱 WhatsApp:</strong></td>
            <td style="color: #930021; padding-bottom: 5px;">${data.whatsapp}</td>
          </tr>
          <tr>
            <td style="color: #924C14; padding-bottom: 5px;"><strong>📍 Dirección:</strong></td>
            <td style="color: #930021; padding-bottom: 5px;">${data.address}</td>
          </tr>
          <tr>
            <td style="color: #924C14; padding-bottom: 5px;"><strong>📅 Fecha de entrega:</strong></td>
            <td style="color: #930021; padding-bottom: 5px;">${data.deliveryDate}</td>
          </tr>
          <tr>
            <td style="color: #924C14; padding-bottom: 5px;"><strong>🕐 Hora:</strong></td>
            <td style="color: #930021; padding-bottom: 5px;">${data.deliveryTime}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Items Table -->
    <tr>
      <td style="padding: 0 20px 30px 20px;">
        <h3 style="color: #930021; margin: 0 0 15px 0; font-size: 20px;">Detalle del Pedido</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 2px solid #F8E19A; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #930021; color: white;">
              <th style="padding: 12px; text-align: left;">Producto</th>
              <th style="padding: 12px; text-align: center;">Cant.</th>
              <th style="padding: 12px; text-align: right;">Precio</th>
              <th style="padding: 12px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 15px; text-align: right; font-size: 18px; font-weight: bold; color: #930021; background-color: #fef9f3;">TOTAL:</td>
              <td style="padding: 15px; text-align: right; font-size: 20px; font-weight: bold; color: #930021; background-color: #fef9f3;">€${data.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </td>
    </tr>

    <!-- Important Note -->
    <tr>
      <td style="padding: 0 20px 30px 20px;">
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>⚠️ Importante:</strong> Las galletas se preparan el mismo día de la entrega para garantizar su frescura. Te contactaremos por WhatsApp para confirmar los detalles.
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #930021; padding: 30px 20px; text-align: center;">
        <p style="color: #F8E19A; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">Crosti Cookies</p>
        <p style="color: #F8E19A; margin: 0; font-size: 14px; opacity: 0.9;">Hechas con amor, entregadas con cuidado 🍪</p>
        <p style="color: #F8E19A; margin: 15px 0 0 0; font-size: 12px; opacity: 0.8;">Generado el ${date}</p>
      </td>
    </tr>
  </table>
</body>
</html>
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
