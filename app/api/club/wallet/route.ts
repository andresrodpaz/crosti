import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { jsPDF } from "jspdf"
import fs from "fs"
import path from "path"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const email = searchParams.get("email")

    if (!email || !type) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: customer } = await supabase.from("club_customers").select("*").eq("email", email).single()
    const { data: config } = await supabase.from("club_card_config").select("*").single()

    if (!customer) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    if (type === "apple" || type === "google" || type === "pdf") {
      
      // Función helper para colores Hex a RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 124, g: 74, b: 30 }; // Fallback a marrón Crosti
      }

      const primary = hexToRgb(config?.primary_color || '#7C4A1E')
      const textCol = hexToRgb(config?.text_color || '#ffffff')
      
      // Tamaño estándar de tarjeta de crédito en mm (85.6 x 53.98)
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 54]
      })

      // 1. Fondo de la tarjeta
      doc.setFillColor(primary.r, primary.g, primary.b)
      doc.rect(0, 0, 85.6, 54, 'F')

      // Configurar tipografía principal
      doc.setTextColor(textCol.r, textCol.g, textCol.b)

      // 2. Insertar Logo
      try {
        const logoPath = path.join(process.cwd(), "public", "images", "crosti-logo-transparent.png")
        if (fs.existsSync(logoPath)) {
          const bitmap = await fs.promises.readFile(logoPath)
          const logoUint8Array = new Uint8Array(bitmap)
          // Add image: x=8, y=8, w=30, h=auto (we guess height based on aspect ratio approx 2.4:1)
          doc.addImage(logoUint8Array, 'PNG', 8, 8, 30, 12.5)
        } else {
          doc.setFontSize(16)
          doc.setFont("helvetica", "bold")
          doc.text("CLUB CROSTI", 8, 14)
        }
      } catch (e) {
        console.error("Error cargando logo en PDF:", e)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("CLUB CROSTI", 8, 14)
      }

      // 3. Progreso de sellos
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const currentStamps = customer.stamp_count || 0
      const totalStamps = config?.stamp_total || 10
      doc.text(`${currentStamps} / ${totalStamps} Sellos`, 8, 26)

      // 4. Nombre del cliente
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(customer.name ? customer.name.toUpperCase() : customer.email, 8, 46)
      
      // Subtítulo
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text("Escanea este QR en la tienda", 8, 50)

      // 5. Generar QR via API pública e insertarlo en el PDF
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(customer.email)}&format=png&margin=0`
        const qrResponse = await fetch(qrUrl)
        if (qrResponse.ok) {
          const qrBuffer = await qrResponse.arrayBuffer()
          const qrUint8Array = new Uint8Array(qrBuffer)
          // Insertamos el QR (x: 58, y: 16, width: 22, height: 22)
          doc.addImage(qrUint8Array, 'PNG', 56, 14, 22, 22)
        }
      } catch (e) {
        console.error("No se pudo generar QR para el PDF", e)
      }

      // Devolver buffer del PDF
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="tarjeta-club-crosti.pdf"`,
        },
      })
    }

    return NextResponse.json({ error: "Tipo de wallet no soportado" }, { status: 400 })

  } catch (error) {
    console.error("Wallet error:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
