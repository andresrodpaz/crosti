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

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF()

  // Crosti brand colors
  const burgundy = [147, 0, 33] // #930021
  const cream = [248, 225, 154] // #F8E19A
  const brown = [146, 76, 20] // #924C14
  const lightGray = [245, 245, 245]

  // --- Header Section ---
  doc.setFillColor(...burgundy)
  doc.rect(0, 0, 210, 50, "F") // Increased header height

  // Title / Logo Area
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(32)
  doc.setFont("helvetica", "bold")
  doc.text("CROSTI", 20, 25)
  
  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.text("cookies & coffee", 20, 34) // Changed subtitle slightly for better aesthetic

  // Invoice Label and Number
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("FACTURA", 185, 25, { align: "right" })
  
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(`${data.orderNumber || 'N/A'}`, 185, 34, { align: "right" })

  // --- Info Section ---
  doc.setTextColor(0, 0, 0)
  
  const col1X = 20
  const col2X = 110
  const startY = 65

  // Column 1: Customer Details
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...burgundy)
  doc.text("CLIENTE", col1X, startY)
  
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  
  let currentY = startY + 8
  const lineHeight = 5

  if (data.customerName) {
    doc.text(data.customerName, col1X, currentY)
    currentY += lineHeight
  }
  
  doc.text(data.customerEmail || '', col1X, currentY)
  currentY += lineHeight
  
  doc.text(data.customerPhone || '', col1X, currentY)
  currentY += lineHeight
  
  // Handing multiline address
  const addressLines = doc.splitTextToSize(data.customerAddress || '', 80)
  doc.text(addressLines, col1X, currentY)


  // Column 2: Order & Delivery Details
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...burgundy)
  doc.text("DETALLES DEL PEDIDO", col2X, startY)

  doc.setTextColor(60, 60, 60)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold") // Labels bold
  
  let col2Y = startY + 8
  
  doc.text("Fecha de Pedido:", col2X, col2Y)
  doc.setFont("helvetica", "normal")
  doc.text(data.date || '', col2X + 35, col2Y)
  col2Y += lineHeight

  doc.setFont("helvetica", "bold")
  doc.text("Fecha Entrega:", col2X, col2Y)
  doc.setFont("helvetica", "normal")
  doc.text(data.deliveryDate || '', col2X + 35, col2Y)
  col2Y += lineHeight

  doc.setFont("helvetica", "bold")
  doc.text("Hora Entrega:", col2X, col2Y)
  doc.setFont("helvetica", "normal")
  doc.text(data.deliveryTime || '', col2X + 35, col2Y)
  col2Y += lineHeight

  if (data.note) {
    col2Y += 2
    doc.setFont("helvetica", "italic")
    doc.setTextColor(100, 100, 100)
    const noteLines = doc.splitTextToSize(`Nota: ${data.note}`, 80)
    doc.text(noteLines, col2X, col2Y)
  }

  // --- Items Table ---
  const tableStartY = Math.max(currentY + (addressLines.length * 5), col2Y) + 15

  const tableBody: any[] = []

  data.items.forEach((item) => {
    const price = typeof item.price === 'number' ? item.price : 0
    const subtotal = typeof item.subtotal === 'number' ? item.subtotal : (price * (item.quantity || 1))
    const quantity = item.quantity || 1
    const name = item.name || 'Producto'

    if (item.packCookies && item.packCookies.length > 0) {
      // Pack Header
      tableBody.push([{ content: name, styles: { fontStyle: 'bold', textColor: [0, 0, 0] } }, quantity.toString(), `€${price.toFixed(2)}`, `€${subtotal.toFixed(2)}`])
      // Pack Items
      item.packCookies.forEach((cookie) => {
        tableBody.push([`  • ${cookie.cookieName || 'Galleta'} (x${cookie.quantity || 1})`, "", "", ""])
      })
    } else {
      // Regular Item
      tableBody.push([name, quantity.toString(), `€${price.toFixed(2)}`, `€${subtotal.toFixed(2)}`])
    }
  })

  autoTable(doc, {
    startY: tableStartY,
    head: [["PRODUCTO", "CANT.", "PRECIO UNIT.", "SUBTOTAL"]],
    body: tableBody,
    theme: "plain", // Cleaner look
    headStyles: {
      fillColor: burgundy,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: 'left',
      cellPadding: 8
    },
    styles: {
      fontSize: 10,
      cellPadding: 6,
      lineColor: [230, 230, 230],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 'auto' }, // Product
      1: { halign: "center", cellWidth: 20 }, // Qty
      2: { halign: "right", cellWidth: 30 }, // Price
      3: { halign: "right", cellWidth: 30 }, // Subtotal
    },
    didParseCell: function(data) {
        // Add bottom border to rows
        if (data.section === 'body') {
            data.cell.styles.lineWidth = { bottom: 0.1 };
            data.cell.styles.lineColor = [230, 230, 230];
        }
    }
  })

  // --- Footer Totals ---
  const finalY = (doc as any).lastAutoTable.finalY + 10

  // Draw a summary box
  const boxWidth = 80
  const boxX = 130 - 20 // aligned to right roughly
  
  // Subtotal
  const subtotalValue = typeof data.subtotal === 'number' ? data.subtotal : 0
  const totalValue = typeof data.total === 'number' ? data.total : subtotalValue

  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  
  doc.text("Subtotal:", 140, finalY)
  doc.text(`€${subtotalValue.toFixed(2)}`, 190, finalY, { align: "right" })
  
  doc.text("Envío:", 140, finalY + 6)
  doc.text("Gratis", 190, finalY + 6, { align: "right" })

  // Total Line
  doc.setDrawColor(...burgundy)
  doc.setLineWidth(0.5)
  doc.line(140, finalY + 10, 190, finalY + 10)

  // Total
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...burgundy)
  doc.text("TOTAL:", 140, finalY + 18)
  doc.text(`€${totalValue.toFixed(2)}`, 190, finalY + 18, { align: "right" })

  // --- Page Footer ---
  const pageHeight = doc.internal.pageSize.height
  
  doc.setFillColor(...cream)
  doc.rect(0, pageHeight - 20, 210, 20, "F") // Footer bar
  
  doc.setFontSize(9)
  doc.setTextColor(...burgundy)
  doc.setFont("helvetica", "bold")
  doc.text("Gracias por elegir Crosti Cookies", 105, pageHeight - 11, { align: "center" })
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text("www.crosti.com • @crosticookies", 105, pageHeight - 6, { align: "center" })

  return doc
}

export function downloadInvoice(data: InvoiceData) {
  const pdf = generateInvoicePDF(data)
  pdf.save(`Factura-Crosti-${data.orderNumber}.pdf`)
}

export function getInvoicePDFBlob(data: InvoiceData): Blob {
  const pdf = generateInvoicePDF(data)
  return pdf.output("blob")
}

export function getInvoicePDFBase64(data: InvoiceData): string {
  const pdf = generateInvoicePDF(data)
  return pdf.output("dataurlstring").split(",")[1]
}
