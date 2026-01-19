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
    <div className="min-h-screen bg-[#F8E19A] flex items-center justify-center py-8">
      <div className="max-w-6xl w-full mx-4">
        <Card className="border-2 border-[#930021]/20 shadow-2xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#930021]">¡Pedido Confirmado!</h1>
                  </div>
                </div>

                <p className="text-lg text-[#924C14] mb-8">
                  Tu pedido ha sido recibido exitosamente. Te enviaremos un correo de confirmación con todos los
                  detalles.
                </p>

                {orderId && (
                  <div className="space-y-4 mb-8">
                    <div className="p-4 bg-[#F8E19A] border border-[#930021]/20 rounded-lg">
                      <p className="text-sm text-[#924C14] mb-1 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Número de pedido:
                      </p>
                      <p className="font-mono font-bold text-lg text-[#930021]">{orderId}</p>
                    </div>

                    {email && (
                      <div className="flex items-start gap-3 text-sm">
                        <Mail className="w-4 h-4 text-[#930021] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[#924C14] font-medium">Confirmación enviada a:</p>
                          <p className="text-[#930021]">{email}</p>
                        </div>
                      </div>
                    )}

                    {date && time && (
                      <div className="flex items-start gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-[#930021] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[#924C14] font-medium">Entrega programada:</p>
                          <p className="text-[#930021]">{date}</p>
                          <p className="text-[#930021]/70 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {time}
                          </p>
                        </div>
                      </div>
                    )}

                    {total && (
                      <div className="pt-4 border-t border-[#930021]/10">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-medium text-[#924C14]">Total pagado:</span>
                          <span className="text-2xl font-bold text-[#930021]">€{total}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-8">
                  <p className="text-sm text-blue-900">
                    <strong>Próximos pasos:</strong> Te contactaremos por WhatsApp para confirmar los detalles de tu
                    entrega.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleDownloadInvoice}
                    disabled={isDownloading}
                    className="w-full h-12 bg-[#930021] hover:bg-[#930021]/90 text-[#F8E19A] font-semibold shadow-md"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {isDownloading ? "Generando factura..." : "Descargar Factura PDF"}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 border-2 border-[#930021] text-[#930021] hover:bg-[#930021]/10 bg-transparent font-medium"
                    >
                      <Link href="/tienda">Seguir Comprando</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 border-2 border-[#930021]/50 text-[#930021]/80 hover:bg-[#930021]/5 bg-transparent"
                    >
                      <Link href="/">Volver al Inicio</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center bg-[#930021] p-12">
                <div className="relative w-full max-w-md">
                  <Image
                    src="/images/crosti-bag-transparent.png"
                    alt="Crosti Bag"
                    width={400}
                    height={500}
                    className="w-full h-auto"
                  />
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
