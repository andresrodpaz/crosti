"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Suspense, useEffect, useState } from "react"
import { CheckCircle2, Calendar, Clock, Mail, Package, Download } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCartStore()
  const [orderData, setOrderData] = useState<any>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const orderId = searchParams.get("orderId")
  const email = searchParams.get("email")
  const date = searchParams.get("date")
  const time = searchParams.get("time")
  const total = searchParams.get("total")

  useEffect(() => {
    const storedOrder = localStorage.getItem("crosti-last-order")

    if (storedOrder) {
      const parsed = JSON.parse(storedOrder)
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        setOrderData(parsed)
        clearCart()
        localStorage.removeItem("crosti-last-order")
      } else {
        router.push("/tienda")
      }
    } else if (!orderId) {
      router.push("/tienda")
    }
  }, [orderId, clearCart, router])

  if (!orderData && !orderId) {
    return (
      <div className="min-h-screen bg-[#F8E19A] flex items-center justify-center">
        <p className="text-[#930021]">Verificando pedido...</p>
      </div>
    )
  }

  const handleDownloadInvoice = async () => {
    if (!orderData) return

    setIsDownloading(true)
    try {
      const response = await fetch("/api/generate-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderData.orderId,
          orderNumber: orderData.orderId.slice(0, 8).toUpperCase(),
          date: new Date().toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          customerName: orderData.name,
          customerEmail: orderData.email,
          customerPhone: orderData.whatsapp,
          customerAddress: orderData.address,
          deliveryDate: orderData.deliveryDate,
          deliveryTime: orderData.deliveryTime,
          items: orderData.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            packCookies: item.packCookies || undefined,
          })),
          subtotal: orderData.totalAmount,
          total: orderData.totalAmount,
          note: orderData.note,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al generar la factura")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Factura-Crosti-${orderData.orderId.slice(0, 8).toUpperCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading invoice:", error)
      alert("Error al descargar la factura. Por favor, inténtalo de nuevo.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8E19A] flex items-center justify-center py-12 px-4">
      <div className="max-w-6xl w-full">
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-3xl">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0 min-h-[600px]">
              {/* Left Column: Content */}
              <div className="p-8 md:p-16 flex flex-col justify-center h-full relative">
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#d1fae5] mb-6 shadow-sm">
                      <CheckCircle2 className="w-10 h-10 text-[#059669]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#930021] mb-4 tracking-tight">¡Pedido Confirmado!</h1>
                    <p className="text-xl text-[#924C14] leading-relaxed">
                      Tu pedido ha sido recibido con éxito.
                      <br/>
                      <span className="text-[#6B5B52] text-base">Hemos enviado los detalles a tu correo.</span>
                    </p>
                  </div>

                  {orderId && (
                    <div className="space-y-6 mb-10 bg-[#FAF7F2] p-8 rounded-2xl border border-[#F0E5D3]">
                      <div className="flex flex-col gap-1 pb-6 border-b border-[#E5DACE]">
                        <span className="text-xs font-bold text-[#924C14] uppercase tracking-widest">Número de Pedido</span>
                        <span className="font-mono text-3xl font-bold text-[#930021] tracking-wider">#{orderId.slice(0, 8).toUpperCase()}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         {email && (
                          <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2 text-[#924C14] mb-1">
                                <Mail className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Email</span>
                             </div>
                             <span className="text-[#1F2937] font-medium break-all">{email}</span>
                          </div>
                         )}

                         {date && (
                          <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2 text-[#924C14] mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Entrega</span>
                             </div>
                             <span className="text-[#1F2937] font-medium">{date}</span>
                             <span className="text-[#6B5B52] text-sm flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {time}
                             </span>
                          </div>
                         )}
                      </div>
                      
                      {total && (
                        <div className="pt-6 border-t border-[#E5DACE] flex justify-between items-end">
                           <span className="text-sm font-medium text-[#6B5B52]">Total Pagado</span>
                           <span className="text-3xl font-bold text-[#930021]">€{total}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <Button
                      onClick={handleDownloadInvoice}
                      disabled={isDownloading}
                      className="w-full h-14 bg-[#930021] hover:bg-[#7a001b] text-[#F8E19A] font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {isDownloading ? "Generando factura..." : "Descargar Factura PDF"}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        asChild
                        variant="outline"
                        className="h-12 border-2 border-[#930021] text-[#930021] hover:bg-[#930021] hover:text-[#F8E19A] font-semibold rounded-xl transition-colors"
                      >
                        <Link href="/tienda">Tienda</Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        className="h-12 text-[#6B5B52] hover:text-[#930021] hover:bg-[#FAF7F2] font-semibold rounded-xl transition-colors"
                      >
                        <Link href="/">Volver al Inicio</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual */}
              <div className="hidden md:flex flex-col items-center justify-center bg-[#930021] p-16 h-full relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#F8E19A] rounded-full mix-blend-overlay opacity-10 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F8E19A] rounded-full mix-blend-overlay opacity-10 blur-3xl -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="relative z-10 w-full max-w-md aspect-square flex items-center justify-center">
                   <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl transform scale-90"></div>
                   <Image
                     src="/images/crosti-bag-transparent.png"
                     alt="Crosti Bag"
                     width={500}
                     height={600}
                     className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                     priority
                   />
                </div>
                
                <div className="text-center mt-12 relative z-10">
                   <h3 className="text-[#F8E19A] text-3xl font-bold mb-3 tracking-tight">Gracias por elegirnos</h3>
                   <p className="text-[#F8E19A]/80 text-lg">Hacemos cada galleta con amor para ti.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8E19A] flex items-center justify-center">
          <p className="text-[#930021]">Cargando...</p>
        </div>
      }
    >
      <ConfirmacionContent />
    </Suspense>
  )
}
