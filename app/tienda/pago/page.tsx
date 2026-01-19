"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCartStore } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Lock, Shield, ShoppingBag, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cartStore = useCartStore()
  const { items, getTotalPrice } = cartStore
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  const orderData = {
    name: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    whatsapp: searchParams.get("whatsapp") || "",
    address: searchParams.get("address") || "",
    delivery_date: searchParams.get("delivery_date") || "",
    delivery_time: searchParams.get("delivery_time") || "",
    note: searchParams.get("note") || "",
  }

  const scrollToSection = (sectionId: string) => {
    window.location.href = `/#${sectionId}`
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    if (items.length === 0 || !orderData.email) {
      router.push("/tienda/checkout")
    }
  }, [items, orderData.email, router])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4)
    }
    return v
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    console.log("[Message] Starting payment submission")

    if (cardData.cardNumber.replace(/\s/g, "").length !== 16) {
      setError("Número de tarjeta inválido")
      setIsSubmitting(false)
      return
    }

    if (cardData.cvv.length !== 3) {
      setError("CVV inválido")
      setIsSubmitting(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("[Message] Creating order with data:", { ...orderData, items, total_amount: getTotalPrice() })

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderData,
          items,
          total_amount: getTotalPrice(),
          payment_method: "card",
          card_last4: cardData.cardNumber.slice(-4),
        }),
      })

      const data = await response.json()
      console.log("[Message] Order creation response:", data)

      if (!response.ok) {
        console.log("[Message] Order creation error:", data.error)
        throw new Error(data.error || "Error al procesar el pedido")
      }

      const orderConfirmation = {
        orderId: data.orderId,
        email: orderData.email,
        date: orderData.delivery_date,
        time: orderData.delivery_time,
        total: getTotalPrice().toFixed(2),
        items: items,
        timestamp: Date.now(),
      }

      localStorage.setItem("crosti-last-order", JSON.stringify(orderConfirmation))

      const orderDetailsParams = new URLSearchParams({
        orderId: data.orderId,
        email: orderData.email,
        date: orderData.delivery_date,
        time: orderData.delivery_time,
        total: getTotalPrice().toFixed(2),
      })

      router.push(`/tienda/confirmacion?${orderDetailsParams.toString()}`)
    } catch (err) {
      console.log("[Message] Payment error:", err)
      setError(err instanceof Error ? err.message : "Error al procesar el pago")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F8E19A] flex flex-col animate-fade-in">
      <header className="relative z-20 bg-[#F8E19A] flex items-center justify-between px-4 md:px-8 lg:px-16 py-4 md:py-5 border-b border-[#930021]/10">
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 md:mb-8 bg-[#930021]/5 border border-[#930021]/20 rounded-xl p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#930021] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-[#930021]">Pago 100% seguro</p>
              <p className="text-[10px] md:text-xs text-[#930021]/70">
                Tu información está protegida con encriptación de nivel bancario
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
            <div className="lg:col-span-5 max-w-3xl mx-auto w-full animate-slide-up">
              <Card className="border-2 border-[#930021]/20 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-[#930021]">
                    <CreditCard className="w-5 h-5" />
                    Pago con Tarjeta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <div>
                      <Label htmlFor="cardNumber" className="text-sm md:text-base text-[#930021]">
                        Número de Tarjeta *
                      </Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          type="text"
                          required
                          maxLength={19}
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                          placeholder="1234 5678 9012 3456"
                          className="pr-12 border-[#930021]/20 focus:border-[#930021] h-11 md:h-10 text-base"
                        />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#930021]/40" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardName" className="text-sm md:text-base text-[#930021]">
                        Nombre del Titular *
                      </Label>
                      <Input
                        id="cardName"
                        type="text"
                        required
                        value={cardData.cardName}
                        onChange={(e) => setCardData({ ...cardData, cardName: e.target.value.toUpperCase() })}
                        placeholder="NOMBRE COMPLETO"
                        className="uppercase border-[#930021]/20 focus:border-[#930021] h-11 md:h-10 text-base"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <Label htmlFor="expiryDate" className="text-sm md:text-base text-[#930021]">
                          Fecha de Expiración *
                        </Label>
                        <Input
                          id="expiryDate"
                          type="text"
                          required
                          maxLength={5}
                          value={cardData.expiryDate}
                          onChange={(e) => setCardData({ ...cardData, expiryDate: formatExpiryDate(e.target.value) })}
                          placeholder="MM/AA"
                          className="border-[#930021]/20 focus:border-[#930021] h-11 md:h-10 text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-sm md:text-base text-[#930021]">
                          CVV *
                        </Label>
                        <div className="relative">
                          <Input
                            id="cvv"
                            type="text"
                            required
                            maxLength={3}
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "") })}
                            placeholder="123"
                            className="border-[#930021]/20 focus:border-[#930021] h-11 md:h-10 text-base"
                          />
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#930021]/40" />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">{error}</div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 md:h-11 bg-[#930021] hover:bg-[#930021]/90 text-[#F8E19A] font-bold text-base md:text-sm"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Procesando pago..." : `Pagar €${getTotalPrice().toFixed(2)}`}
                    </Button>

                    <div className="flex items-center justify-center gap-4 pt-2 md:pt-4 text-xs text-[#930021]/60">
                      <Lock className="w-3 h-3" />
                      <span>Conexión segura SSL</span>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#930021]/20 bg-white mt-6">
                <CardHeader>
                  <CardTitle className="text-base text-[#930021]">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-12 h-12 bg-[#F8E19A]/30 rounded-md relative overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl || "/placeholder.svg?height=48&width=48"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate text-[#930021]">{item.name}</p>
                        <p className="text-xs text-[#930021]/60">
                          {item.quantity}x €{item.price.toFixed(2)}
                        </p>
                        {item.isPack && item.packCookies && (
                          <div className="mt-1 text-[10px] text-[#930021]/50">
                            {item.packCookies.map((pc, i) => (
                              <div key={i}>
                                {pc.quantity}x {pc.cookieName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="font-semibold text-sm text-[#930021]">
                        €{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-[#930021]/10 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#930021]/60">Subtotal</span>
                      <span className="text-[#930021]">€{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#930021]/60">Envío</span>
                      <span className="text-[#930021] font-semibold">Gratis</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#930021]/10">
                      <span className="text-[#930021]">Total</span>
                      <span className="text-[#930021]">€{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#930021]/10">
                    <p className="text-xs font-medium mb-2 text-[#930021]">Entrega programada:</p>
                    <p className="text-xs text-[#930021]/70">{orderData.delivery_date}</p>
                    <p className="text-xs text-[#930021]/70">{orderData.delivery_time}</p>
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
