"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingBag, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    whatsapp: "",
    address: "",
    delivery_date: "",
    delivery_time: "",
    name: "",
    note: "",
  })

  const scrollToSection = (sectionId: string) => {
    window.location.href = `/#${sectionId}`
    setMobileMenuOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(formData)
    router.push(`/tienda/pago?${params.toString()}`)
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
      <header className="relative z-20 bg-[#F8E19A] flex items-center justify-between px-4 md:px-8 lg:px-16 py-4 md:py-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/crosti-logo-transparent.png"
            alt="Crosti Cookies Logo"
            width={200}
            height={90}
            className="h-14 md:h-16 lg:h-20 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          <Link
            href="/"
            className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium"
          >
            Inicio
          </Link>
          <button
            onClick={() => scrollToSection("nosotros")}
            className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium"
          >
            Nosotros
          </button>
          <button
            onClick={() => scrollToSection("galletas")}
            className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium"
          >
            Galletas
          </button>
          <button
            onClick={() => scrollToSection("contacto")}
            className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium"
          >
            Contacto
          </button>
          <Link
            href="/tienda"
            className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium flex items-center gap-2 font-bold"
          >
            <ShoppingBag className="w-5 h-5" />
            Tienda
          </Link>
        </nav>

        <button
          className="md:hidden text-[#930021] p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[#F8E19A] z-30 px-4 py-4 shadow-lg border-t border-[#930021]/10">
          <nav className="flex flex-col gap-4">
            <Link href="/" className="text-[#930021] text-lg font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Inicio
            </Link>
            <button
              onClick={() => scrollToSection("nosotros")}
              className="text-[#930021] text-lg font-medium py-2 text-left"
            >
              Nosotros
            </button>
            <button
              onClick={() => scrollToSection("galletas")}
              className="text-[#930021] text-lg font-medium py-2 text-left"
            >
              Galletas
            </button>
            <button
              onClick={() => scrollToSection("contacto")}
              className="text-[#930021] text-lg font-medium py-2 text-left"
            >
              Contacto
            </button>
            <Link
              href="/tienda"
              className="text-[#930021] text-lg font-bold py-2 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="w-5 h-5" />
              Tienda
            </Link>
          </nav>
        </div>
      )}

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
                    <div>
                      <Label htmlFor="name" className="text-sm md:text-base text-[#930021]">
                        Nombre Completo *
                      </Label>
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
                      <Label htmlFor="email" className="text-sm md:text-base text-[#930021]">
                        Correo Electrónico *
                      </Label>
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
                      <Label htmlFor="whatsapp" className="text-sm md:text-base text-[#930021]">
                        WhatsApp *
                      </Label>
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

                    <div>
                      <Label htmlFor="address" className="text-sm md:text-base text-[#930021]">
                        Dirección de Entrega *
                      </Label>
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
                      <Label htmlFor="delivery_date" className="text-sm md:text-base text-[#930021]">
                        Fecha de Entrega *
                      </Label>
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
                      <Label htmlFor="delivery_time" className="text-sm md:text-base text-[#930021]">
                        Franja Horaria *
                      </Label>
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

                    <div>
                      <Label htmlFor="note" className="text-sm md:text-base text-[#930021]">
                        Nota Adicional
                      </Label>
                      <Textarea
                        id="note"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Añade cualquier nota adicional aquí"
                        rows={3}
                        className="border-[#930021]/20 focus:border-[#930021] text-base resize-none"
                      />
                    </div>

                    <Button type="submit" className="bg-[#930021] hover:bg-[#930021]/90 text-[#F8E19A] w-full">
                      Finalizar Pedido
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="border-2 border-[#930021]/20 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg md:text-xl text-[#930021]">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id} className="flex justify-between items-center">
                        <span className="text-base md:text-lg text-[#930021]">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="text-base md:text-lg text-[#930021]">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex justify-between items-center">
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
