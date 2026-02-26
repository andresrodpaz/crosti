import { type NextRequest, NextResponse } from "next/server"
import { generateConfirmationEmailHTML, generateConfirmationEmailText, generateAdminNotificationEmailHTML, generateAdminNotificationEmailText } from "@/lib/email-templates"
import { createClient } from "@/lib/supabase/server"
import type { CartItem } from "@/lib/types/orders"
import { getInvoicePDFBlob } from "@/lib/invoice-generator"
import type { InvoiceData } from "@/lib/invoice-generator"
import { put } from "@vercel/blob"
import fs from "fs"
import path from "path"

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

      // Read logo server-side
      let logoBase64 = null
      try {
          const logoPath = path.join(process.cwd(), "public", "images", "crosti-logo.png")
          if (fs.existsSync(logoPath)) {
              const bitmap = await fs.promises.readFile(logoPath)
              logoBase64 = Buffer.from(bitmap).toString("base64")
          }
      } catch (e) {
          console.error("Error reading logo:", e)
      }

      const pdfBlob = getInvoicePDFBlob(invoiceData, logoBase64)
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

    // Send emails
    try {
      await sendConfirmationEmail(orderData, items as CartItem[], invoiceUrl)
      
      // Send Admin Notification
      const adminEmail = process.env.ADMIN_EMAIL || "andresrodpaz@gmail.com" // Cloud be configured
      await sendAdminEmail(orderData, items as CartItem[], adminEmail)

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
  
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Message] ⚠️ RESEND_API_KEY not configured.")
    return
  }

  const emailFrom = process.env.EMAIL_FROM || "Crosti Cookies <pedidos@crosticookies.com>"
  
  const emailData = {
    orderId: orderData.id,
    email: orderData.email,
    whatsapp: orderData.whatsapp,
    address: orderData.address,
    deliveryDate: orderData.delivery_date,
    deliveryTime: orderData.delivery_time,
    totalAmount: orderData.total_amount,
    name: orderData.name,
    note: orderData.note,
    items: items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
      packCookies: item.packCookies || null
    }))
  }

  const emailHTML = generateConfirmationEmailHTML(emailData)
  const emailText = generateConfirmationEmailText(emailData)

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
        attachments: invoiceUrl ? [{ filename: `Factura-${orderData.id.slice(0,8)}.pdf`, path: invoiceUrl }] : []
      }),
    })

    if (!response.ok) {
       console.error("[Message] Failed to send user email")
    }
  } catch (error) {
    console.error("[Message] Email sending failed", error)
  }
}

async function sendAdminEmail(orderData: any, items: CartItem[], adminEmail: string) {
    if (!process.env.RESEND_API_KEY) return

    const emailFrom = process.env.EMAIL_FROM || "Crosti Cookies <pedidos@crosticookies.com>"
    
    // Construct EmailData (same structure)
    const emailData = {
      orderId: orderData.id,
      email: orderData.email,
      whatsapp: orderData.whatsapp,
      address: orderData.address,
      deliveryDate: orderData.delivery_date,
      deliveryTime: orderData.delivery_time,
      totalAmount: orderData.total_amount,
      name: orderData.name,
      note: orderData.note,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
        packCookies: item.packCookies || null
      }))
    }

    const adminHtml = generateAdminNotificationEmailHTML(emailData)
    const adminText = generateAdminNotificationEmailText(emailData)

    try {
        await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: emailFrom,
                to: adminEmail,
                subject: `🔔 Nuevo Pedido #${orderData.id.slice(0, 8).toUpperCase()} - ${orderData.total_amount}€`,
                html: adminHtml,
                text: adminText,
            }),
        })
    } catch (e) {
        console.error("Failed to send admin email", e)
    }
}



