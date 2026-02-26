import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export interface InvoiceData {
  orderId: string
  orderNumber: string
  date: string
  customerName?: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  deliveryDate: string
  deliveryTime: string
  items: Array<{
    name: string
    quantity: number
    price: number
    subtotal: number
    packCookies?: Array<{ cookieId: string; cookieName: string; quantity: number }>
  }>
  subtotal: number
  total: number
  note?: string
}

export function generateInvoicePDF(data: InvoiceData, logoBase64?: string | null): jsPDF {
  const doc = new jsPDF()

  // Crosti Brand Colors
  const burgundy = "#930021"
  const cream = "#F8E19A" 
  const darkText = "#1F2937" // Gray-800
  const lightText = "#6B7280" // Gray-500

  // --- Header ---
  let startY = 20

  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", 15, 15, 40, 40) // Adjust size/pos
    } catch (e) {
      console.error("Failed to add image to PDF", e)
    }
  } else {
    // Fallback text if no logo
    doc.setFontSize(28)
    doc.setTextColor(burgundy)
    doc.setFont("helvetica", "bold")
    doc.text("CROSTI", 20, 30)
  }

  // Invoice Details (Right aligned)
  doc.setFontSize(10)
  doc.setTextColor(lightText)
  doc.setFont("helvetica", "bold")
  doc.text("FACTURA", 190, 20, { align: "right" })
  
  doc.setFontSize(14)
  doc.setTextColor(darkText)
  doc.text(`#${data.orderNumber}`, 190, 28, { align: "right" })

  doc.setFontSize(10)
  doc.setTextColor(lightText)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${data.date}`, 190, 35, { align: "right" })

  // --- Separator ---
  doc.setDrawColor(230, 230, 230)
  doc.line(20, 60, 190, 60)

  // --- Client & Delivery Info ---
  const infoY = 75
  const col1 = 20
  const col2 = 110

  // Client Column
  doc.setFontSize(10)
  doc.setTextColor(burgundy)
  doc.setFont("helvetica", "bold")
  doc.text("FACTURADO A", col1, infoY)

  doc.setFontSize(10)
  doc.setTextColor(darkText)
  doc.setFont("helvetica", "bold")
  doc.text(data.customerName || "Cliente", col1, infoY + 8)

  doc.setFontSize(10)
  doc.setTextColor(lightText)
  doc.setFont("helvetica", "normal")
  doc.text(data.customerEmail, col1, infoY + 14)
  doc.text(data.customerPhone, col1, infoY + 20)
  
  const addressLines = doc.splitTextToSize(data.customerAddress, 80)
  doc.text(addressLines, col1, infoY + 26)

  // Delivery Column
  doc.setFontSize(10)
  doc.setTextColor(burgundy)
  doc.setFont("helvetica", "bold")
  doc.text("DETALLES DE ENTREGA", col2, infoY)

  doc.setTextColor(darkText)
  
  let deliveryY = infoY + 8
  doc.setFont("helvetica", "bold")
  doc.text("Fecha:", col2, deliveryY)
  doc.setFont("helvetica", "normal")
  doc.text(data.deliveryDate, col2 + 25, deliveryY)
  
  deliveryY += 6
  doc.setFont("helvetica", "bold")
  doc.text("Hora:", col2, deliveryY)
  doc.setFont("helvetica", "normal")
  doc.text(data.deliveryTime, col2 + 25, deliveryY)

  if (data.note) {
    deliveryY += 8
    doc.setTextColor(lightText)
    doc.setFont("helvetica", "italic")
    const noteLines = doc.splitTextToSize(`Nota: ${data.note}`, 80)
    doc.text(noteLines, col2, deliveryY)
  }

  // --- Items Table ---
  const tableY = Math.max(infoY + 26 + (addressLines.length * 4), deliveryY + 15) + 15

  const tableBody: any[] = []
  
  data.items.forEach((item) => {
    tableBody.push([
      item.name,
      item.quantity,
      `€${item.price.toFixed(2)}`,
      `€${item.subtotal.toFixed(2)}`
    ])
    
    if (item.packCookies && item.packCookies.length > 0) {
       item.packCookies.forEach(c => {
         tableBody.push([
           `  • ${c.cookieName} (x${c.quantity})`,
           "",
           "",
           ""
         ])
       })
    }
  })

  autoTable(doc, {
    startY: tableY,
    head: [["DESCRIPCIÓN", "CANT.", "PRECIO UNIT.", "TOTAL"]],
    body: tableBody,
    theme: 'grid',
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      textColor: [60, 60, 60],
      lineColor: [240, 240, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: burgundy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252]
    }
  })

  // --- Footer Totals ---
  const finalY = (doc as any).lastAutoTable.finalY + 15

  const totalsX = 130
  
  doc.setFontSize(10)
  doc.setTextColor(lightText)
  doc.text("Subtotal:", totalsX, finalY)
  doc.setTextColor(darkText)
  doc.text(`€${data.subtotal.toFixed(2)}`, 190, finalY, { align: "right" })

  doc.setTextColor(lightText)
  doc.text("Envío:", totalsX, finalY + 6)
  doc.setTextColor(darkText)
  doc.text("Gratis", 190, finalY + 6, { align: "right" })

  // Total Bar
  doc.setFillColor(burgundy)
  doc.rect(totalsX - 5, finalY + 12, 75, 12, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("TOTAL", totalsX, finalY + 20)
  doc.text(`€${data.total.toFixed(2)}`, 190, finalY + 20, { align: "right" })

  // --- Bottom Footer ---
  const pageHeight = doc.internal.pageSize.height
  
  doc.setDrawColor(240, 240, 240)
  doc.line(20, pageHeight - 25, 190, pageHeight - 25)

  doc.setFontSize(9)
  doc.setTextColor(lightText)
  doc.setFont("helvetica", "normal")
  doc.text("Gracias por su compra", 105, pageHeight - 18, { align: "center" })
  doc.text("www.crosticookies.com", 105, pageHeight - 13, { align: "center" })

  return doc
}

// Client-side helper that delegates to API to ensure consistent PDF generation (with logo)
export async function downloadInvoice(data: InvoiceData) {
  try {
    const response = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error("Failed to generate invoice");
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob as any); // cast for safety
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `Factura-Crosti-${data.orderNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading invoice:", error);
    alert("Error al descargar la factura. Por favor intente nuevamente.");
  }
}

export function getInvoicePDFBlob(data: InvoiceData, logoBase64?: string | null): Blob {
  const pdf = generateInvoicePDF(data, logoBase64)
  return pdf.output("blob")
}

export function getInvoicePDFBase64(data: InvoiceData, logoBase64?: string | null): string {
  const pdf = generateInvoicePDF(data, logoBase64)
  return pdf.output("dataurlstring").split(",")[1]
}
