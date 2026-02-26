import { type NextRequest, NextResponse } from "next/server"
import { generateInvoicePDF } from "@/lib/invoice-generator"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const invoiceData = await request.json()

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

    // Now generate sync (or async if we made it async, but I made it sync in lib)
    const pdf = generateInvoicePDF(invoiceData, logoBase64)
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Factura-Crosti-${invoiceData.orderNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[Message] Error generating invoice:", error)
    return NextResponse.json({ error: "Error al generar la factura" }, { status: 500 })
  }
}
