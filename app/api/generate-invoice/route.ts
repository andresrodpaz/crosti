import { type NextRequest, NextResponse } from "next/server"
import { generateInvoicePDF } from "@/lib/invoice-generator"

export async function POST(request: NextRequest) {
  try {
    const invoiceData = await request.json()

    const pdf = generateInvoicePDF(invoiceData)
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
