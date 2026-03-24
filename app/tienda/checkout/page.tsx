"use client"

import type React from "react"
import { useState } from "react"
import { useCartStore } from "@/lib/cart-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { NewsBanner } from "@/components/news-banner"

const WHATSAPP_NUMBER = "34643328500" // ← Cambia esto por el número real

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [orderSent, setOrderSent] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    delivery_type: "delivery", // "delivery" | "pickup"
    address: "",
    delivery_date: "",
    delivery_time: "",
    note: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formatDate = (iso: string) => {
      if (!iso) return ""
      const [y, m, d] = iso.split("-")
      return `${d}/${m}/${y}`
    }

    const itemLines = items
      .map((item) => `  - ${item.name} x${item.quantity} (${(item.price * item.quantity).toFixed(2)} EUR)`)
      .join("\n")

    const total = getTotalPrice().toFixed(2)

    const deliveryInfo =
      formData.delivery_type === "pickup"
        ? `Tipo: Recogida en tienda`
        : `Tipo: Entrega a domicilio\nDireccion: ${formData.address}\nFecha: ${formatDate(formData.delivery_date)}\nFranja horaria: ${formData.delivery_time}`

    const message = [
      "*Nuevo Pedido - Crosti Cookies*",
      "",
      `Nombre: ${formData.name}`,
      `Email: ${formData.email}`,
      `WhatsApp: ${formData.whatsapp}`,
      "",
      deliveryInfo,
      "",
      "*Productos:*",
      itemLines,
      "",
      `*Total: ${total} EUR*`,
      ...(formData.note ? ["", `Nota: ${formData.note}`] : []),
    ].join("\n")

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank")

    setOrderSent(true)
    setTimeout(() => {
      clearCart()
      router.push("/tienda")
    }, 1400)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8E19A] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-[#930021]/20 bg-white">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#930021]">Carrito vacío</h2>
            <p className="text-[#930021]/70 mb-6">No tienes productos en tu carrito</p>
            <Button asChild className="bg-[#930021] hover:bg-[#930021]/90 text-[#F8E19A]">
              <Link href="/tienda">Ir a la tienda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateString = minDate.toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-[#F8E19A] flex flex-col">
      <NewsBanner />
      <Navbar />

      <div className="container mx-auto px-4 py-8 lg:py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-[#930021]">Finalizar Pedido</h1>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* Order Form */}
            <div>
              <Card className="border-2 border-[#930021]/20 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg md:text-xl text-[#930021]">Información de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                    {/* Personal info */}
                    <div>
                      <Label htmlFor="name" className="text-sm md:text-base text-[#930021]">Nombre Completo *</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Tu nombre completo"
                        className="border-[#930021]/20 focus:border-[#930021] h-11 md:h-10 text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm md:text-base text-[#930021]">Correo Electrónico *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="tu@email.com"
                        className="border-[#930021]/20 focus:border-[#930021] h-11 md:h-10 text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp" className="text-sm md:text-base text-[#930021]">WhatsApp *</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        required
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="+34 600 000 000"
                        className="border-[#930021]/20 focus:border-[#930021] h-11 md:h-10 text-base"
                      />
                    </div>

                    {/* Delivery type toggle */}
                    <div>
                      <Label className="text-sm md:text-base text-[#930021] mb-2 block">Tipo de entrega *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, delivery_type: "delivery" })}
                          className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                            formData.delivery_type === "delivery"
                              ? "bg-[#930021] border-[#930021] text-white"
                              : "bg-white border-[#930021]/20 text-[#930021] hover:border-[#930021]/50"
                          }`}
                        >
                          Entrega a domicilio
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, delivery_type: "pickup" })}
                          className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                            formData.delivery_type === "pickup"
                              ? "bg-[#930021] border-[#930021] text-white"
                              : "bg-white border-[#930021]/20 text-[#930021] hover:border-[#930021]/50"
                          }`}
                        >
                          Recogida en tienda
                        </button>
                      </div>
                    </div>

                    {/* Delivery-only fields */}
                    {formData.delivery_type === "delivery" && (
                      <>
                        <div>
                          <Label htmlFor="address" className="text-sm md:text-base text-[#930021]">Dirección de Entrega *</Label>
                          <Textarea
                            id="address"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Calle, número, piso, código postal, ciudad"
                            rows={3}
                            className="border-[#930021]/20 focus:border-[#930021] text-base resize-none"
                          />
                        </div>

                        <div>
                          <Label htmlFor="delivery_date" className="text-sm md:text-base text-[#930021]">Fecha de Entrega *</Label>
                          <Input
                            id="delivery_date"
                            type="date"
                            required
                            min={minDateString}
                            value={formData.delivery_date}
                            onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                            className="border-[#930021]/20 focus:border-[#930021] h-11 md:h-10 text-base"
                          />
                          <p className="text-xs text-[#930021]/70 mt-1.5">
                            Los pedidos deben programarse con al menos 24 horas de antelación
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="delivery_time" className="text-sm md:text-base text-[#930021]">Franja Horaria *</Label>
                          <Select
                            value={formData.delivery_time}
                            onValueChange={(value) => setFormData({ ...formData, delivery_time: value })}
                            required
                          >
                            <SelectTrigger className="border-[#930021]/20 focus:border-[#930021] h-11 md:h-10 text-base">
                              <SelectValue placeholder="Selecciona una franja horaria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mañana (8:00 - 12:00)">Mañana (8:00 - 12:00)</SelectItem>
                              <SelectItem value="Tarde (12:00 - 16:00)">Tarde (12:00 - 16:00)</SelectItem>
                              <SelectItem value="Noche (16:00 - 20:00)">Noche (16:00 - 20:00)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {/* Pickup info banner */}
                    {formData.delivery_type === "pickup" && (
                      <div className="bg-[#F8E19A]/60 border border-[#930021]/20 rounded-xl p-4 text-sm text-[#930021]">
                        <p className="font-semibold mb-1">📍 Recogida en tienda</p>
                        <p>Te contactaremos por WhatsApp para confirmar el horario de recogida disponible.</p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="note" className="text-sm md:text-base text-[#930021]">Nota Adicional</Label>
                      <Textarea
                        id="note"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Añade cualquier nota adicional aquí"
                        rows={3}
                        className="border-[#930021]/20 focus:border-[#930021] text-base resize-none"
                      />
                    </div>

                    {orderSent && (
                      <div className="mb-4 rounded-xl bg-green-50 border border-green-200 text-green-800 px-4 py-2 text-sm font-medium">
                        Pedido enviado! Te redirigimos a la tienda...
                      </div>
                    )}
                    <Button
                      type="submit"
                      disabled={orderSent}
                      className="bg-[#25D366] hover:bg-[#1ebe5d] text-white w-full h-12 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Finalizar pedido por WhatsApp
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="border-2 border-[#930021]/20 bg-white lg:sticky lg:top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg md:text-xl text-[#930021]">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li key={item.id} className="flex justify-between items-center gap-2">
                        <span className="text-sm md:text-base text-[#930021] flex-1 leading-snug">
                          {item.name} <span className="font-bold">×{item.quantity}</span>
                        </span>
                        <span className="text-sm md:text-base font-semibold text-[#930021] whitespace-nowrap">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-4 border-t-2 border-[#930021]/20 flex justify-between items-center">
                    <span className="text-lg md:text-xl font-bold text-[#930021]">Total:</span>
                    <span className="text-lg md:text-xl font-bold text-[#930021]">€{getTotalPrice().toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}