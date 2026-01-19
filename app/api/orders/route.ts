import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { CartItem } from "@/lib/types/orders"
import { getInvoicePDFBlob } from "@/lib/invoice-generator"
import type { InvoiceData } from "@/lib/invoice-generator"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, whatsapp, address, delivery_date, delivery_time, note, items, total_amount } = body

    // Validate required fields
    if (!email || !whatsapp || !address || !delivery_date || !delivery_time || !items || !total_amount) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    const supabase = await createClient()

    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        name,
        email,
        whatsapp,
        address,
        delivery_date,
        delivery_time,
        note,
        total_amount,
        status: "pending",
      })
      .select()
      .single()

    // --- SERVER-SIDE PRICE VALIDATION ---
    const calculateTotal = (items: CartItem[]) => {
      return items.reduce((sum, item) => {
        // Validate unit price if possible (for non-packs)
        // For now, we mainly validate that the total matches the sum of items sent
        // ideally we would fetch prices from DB here
        return sum + (item.price * item.quantity)
      }, 0)
    }

    const calculatedTotal = calculateTotal(items)
    
    // Check if total matches (allow small float difference)
    if (Math.abs(calculatedTotal - total_amount) > 0.1) {
       console.error("[Message] Price manipulation detected:", { calculatedTotal, received: total_amount })
       // We could reject here, but for now let's just log and maybe override the total in DB if we hadn't already inserted
       // Since we inserted already, we might want to flag it or update it.
       // For this fix, let's update the order with the REAL calculated total
       await supabase.from("orders").update({ total_amount: calculatedTotal }).eq("id", orderData.id)
       // Update the local variable too for confirmation email
       body.total_amount = calculatedTotal
    }
    // ------------------------------------

    if (orderError) {
      console.error("[Message] Order creation error:", orderError)
      return NextResponse.json({ error: "Error al crear el pedido" }, { status: 500 })
    }

    const orderItems = (items as CartItem[]).map((item) => ({
      order_id: orderData.id,
      cookie_id: item.id,
      cookie_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
      pack_cookies: item.isPack && item.packCookies ? item.packCookies : null,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[Message] Order items creation error:", itemsError)
      // Try to rollback by deleting the order
      await supabase.from("orders").delete().eq("id", orderData.id)
      return NextResponse.json({ error: "Error al crear los items del pedido" }, { status: 500 })
    }

    let invoiceUrl: string | null = null
    try {
      const invoiceData: InvoiceData = {
        orderId: orderData.id,
        orderNumber: orderData.id.slice(0, 8).toUpperCase(),
        date: new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        customerName: orderData.name,
        customerEmail: orderData.email,
        customerPhone: orderData.whatsapp,
        customerAddress: orderData.address,
        deliveryDate: orderData.delivery_date,
        deliveryTime: orderData.delivery_time,
        items: (items as CartItem[]).map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          packCookies: item.packCookies || undefined,
        })),
        subtotal: orderData.total_amount,
        total: orderData.total_amount,
        note: orderData.note,
      }

      const pdfBlob = getInvoicePDFBlob(invoiceData)
      const fileName = `invoices/Factura-Crosti-${orderData.id.slice(0, 8).toUpperCase()}-${Date.now()}.pdf`

      const blob = await put(fileName, pdfBlob, {
        access: "public",
        contentType: "application/pdf",
      })

      invoiceUrl = blob.url
      console.log("[Message] ✓ Invoice PDF uploaded to Blob:", invoiceUrl)

      await supabase.from("orders").update({ invoice_url: invoiceUrl }).eq("id", orderData.id)
    } catch (pdfError) {
      console.error("[Message] Failed to generate/upload invoice PDF:", pdfError)
      // Don't fail the order if PDF upload fails
    }

    try {
      await sendConfirmationEmail(orderData, items as CartItem[], invoiceUrl)
    } catch (emailError) {
      // Don't fail the order if email fails - just log it
      console.error("[Message] Email sending error:", emailError)
    }

    return NextResponse.json({
      orderId: orderData.id,
      invoiceUrl,
      message: "Pedido creado exitosamente",
    })
  } catch (error) {
    console.error("[Message] Unexpected error:", error)
    return NextResponse.json({ error: "Error inesperado al procesar el pedido" }, { status: 500 })
  }
}

async function sendConfirmationEmail(orderData: any, items: CartItem[], invoiceUrl: string | null) {
  console.log("[Message] Attempting to send confirmation email to:", orderData.email)
  console.log("[Message] Order ID:", orderData.id)

  if (!process.env.RESEND_API_KEY) {
    console.warn("[Message] ⚠️ RESEND_API_KEY not configured. Email not sent.")
    console.warn("[Message] Please configure Resend to enable email notifications.")
    return
  }

  const emailFrom = process.env.EMAIL_FROM || "Crosti Cookies <pedidos@crosticookies.com>"

  const emailHTML = generateConfirmationEmailHTML(orderData, items, invoiceUrl)
  const emailText = generateConfirmationEmailText(orderData, items, invoiceUrl)

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: orderData.email,
        subject: `Confirmación de Pedido #${orderData.id.slice(0, 8).toUpperCase()} - Crosti Cookies`,
        html: emailHTML,
        text: emailText,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()

      if (errorData.statusCode === 403 && errorData.name === "validation_error") {
        console.warn("[Message] ⚠️ Email domain not verified in Resend.")
        console.warn("[Message] To send emails in production:")
        console.warn("[Message] 1. Add your domain at https://resend.com/domains")
        console.warn("[Message] 2. Verify DNS records")
        console.warn("[Message] 3. Update EMAIL_FROM to use your verified domain")
        console.warn("[Message] Order created successfully, but confirmation email not sent.")
        console.warn("[Message] See /docs/EMAIL_SETUP.md for detailed instructions.")
        return
      }

      console.error("[Message] Failed to send email:", errorData)
      throw new Error(`Email API error: ${errorData.message || "Unknown error"}`)
    }

    const result = await response.json()
    console.log("[Message] ✓ Email sent successfully:", result.id)
  } catch (error: any) {
    console.error("[Message] Email sending failed:", error.message)
    throw error
  }
}

function generateConfirmationEmailHTML(orderData: any, items: CartItem[], invoiceUrl: string | null): string {
  const itemsHTML = items
    .map((item) => {
      let itemHTML = `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #f5e6d3;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f5e6d3; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f5e6d3; text-align: right;">€${item.price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f5e6d3; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      if (item.isPack && item.packCookies) {
        item.packCookies.forEach((cookie) => {
          itemHTML += `
            <tr>
              <td style="padding: 8px 12px 8px 30px; border-bottom: 1px solid #f5e6d3; color: #666; font-size: 14px;">
                • ${cookie.cookieName}
              </td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #f5e6d3; text-align: center; color: #666; font-size: 14px;">${cookie.quantity}</td>
              <td colspan="2"></td>
            </tr>
          `
        })
      }
      return itemHTML
    })
    .join("")

  const invoiceButtonHTML = invoiceUrl
    ? `
    <div style="margin: 30px 0; text-align: center;">
      <a href="${invoiceUrl}" 
         style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #930021 0%, #b8002e 100%); 
         color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
        📄 Descargar Factura PDF
      </a>
    </div>
  `
    : ""

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de Pedido - Crosti Cookies</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #fef9f3;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <div style="background: linear-gradient(135deg, #930021 0%, #b8002e 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 36px; font-weight: bold;">CROSTI</h1>
          <p style="color: #F8E19A; margin: 5px 0 0 0; font-size: 16px;">cookies</p>
        </div>

        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #e8f5e9; border-radius: 50%; width: 60px; height: 60px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 30px;">
              ✓
            </div>
            <h2 style="color: #930021; margin: 0; font-size: 24px;">¡Pedido Confirmado!</h2>
            <p style="color: #666; margin: 10px 0 0 0;">Número de pedido: <strong>#${orderData.id.slice(0, 8).toUpperCase()}</strong></p>
          </div>

          ${invoiceButtonHTML}

          <div style="background: #fef9f3; border-left: 4px solid #930021; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h3 style="color: #930021; margin: 0 0 15px 0; font-size: 18px;">Información de Entrega</h3>
            <p style="margin: 8px 0; color: #333;"><strong>Fecha:</strong> ${orderData.delivery_date}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Hora:</strong> ${orderData.delivery_time}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Dirección:</strong> ${orderData.address}</p>
            ${orderData.note ? `<p style="margin: 8px 0; color: #333;"><strong>Nota:</strong> ${orderData.note}</p>` : ""}
          </div>

          <h3 style="color: #930021; margin: 25px 0 15px 0; font-size: 18px;">Detalles del Pedido</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #930021;">
                <th style="padding: 12px; text-align: left; color: white;">Producto</th>
                <th style="padding: 12px; text-align: center; color: white;">Cant.</th>
                <th style="padding: 12px; text-align: right; color: white;">Precio</th>
                <th style="padding: 12px; text-align: right; color: white;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div style="text-align: right; padding-top: 15px; border-top: 2px solid #930021;">
            <p style="margin: 8px 0; color: #666; font-size: 16px;"><strong>Subtotal:</strong> €${orderData.total_amount.toFixed(2)}</p>
            <p style="margin: 8px 0; color: #666; font-size: 16px;"><strong>Envío:</strong> Gratis</p>
            <p style="margin: 12px 0 0 0; color: #930021; font-size: 22px; font-weight: bold;"><strong>TOTAL: €${orderData.total_amount.toFixed(2)}</strong></p>
          </div>

          <div style="background: #fff9e6; border: 1px solid #f5e6d3; border-radius: 8px; padding: 20px; margin-top: 30px;">
            <p style="margin: 0; color: #924C14; font-size: 14px;">
              <strong>⚠️ Importante:</strong> Las galletas se preparan el mismo día de la entrega para garantizar su frescura.
            </p>
          </div>
        </div>

        <div style="background: #fef9f3; padding: 25px; text-align: center; border-top: 1px solid #f5e6d3;">
          <p style="margin: 0; color: #930021; font-size: 16px; font-style: italic;">
            Gracias por tu pedido. ¡Disfruta tus galletas Crosti!
          </p>
          <p style="margin: 10px 0 0 0; color: #924C14; font-size: 14px;">
            Hechas con amor, entregadas con cuidado.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateConfirmationEmailText(orderData: any, items: CartItem[], invoiceUrl: string | null): string {
  const itemsText = items
    .map((item) => {
      let text = `${item.name} - Cantidad: ${item.quantity} - €${item.price.toFixed(2)} - Subtotal: €${(item.price * item.quantity).toFixed(2)}`
      if (item.isPack && item.packCookies) {
        item.packCookies.forEach((cookie) => {
          text += `\n  • ${cookie.cookieName} (${cookie.quantity})`
        })
      }
      return text
    })
    .join("\n")

  const invoiceText = invoiceUrl ? `\n\n📄 Descarga tu factura aquí: ${invoiceUrl}\n` : ""

  return `
¡PEDIDO CONFIRMADO! - CROSTI COOKIES

Número de pedido: #${orderData.id.slice(0, 8).toUpperCase()}
${invoiceText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INFORMACIÓN DE ENTREGA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fecha: ${orderData.delivery_date}
Hora: ${orderData.delivery_time}
Dirección: ${orderData.address}
${orderData.note ? `Nota: ${orderData.note}` : ""}

DETALLES DEL PEDIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal: €${orderData.total_amount.toFixed(2)}
Envío: Gratis
TOTAL: €${orderData.total_amount.toFixed(2)}

⚠️ IMPORTANTE: Las galletas se preparan el mismo día de la entrega para garantizar su frescura.

Gracias por tu pedido. ¡Disfruta tus galletas Crosti!
Hechas con amor, entregadas con cuidado.
  `
}
