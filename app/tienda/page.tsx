"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { useCartStore } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Minus, Plus, Trash2, X, Package, Clock, MapPin, Phone, ChevronDown } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { NewsBanner } from "@/components/news-banner"
import { BoxesSection } from "@/components/boxes-section"
import { CookieSkeletonGrid } from "@/components/ui/cookie-skeleton"


export default function TiendaPage() {
  const [cookies, setCookies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { items, addItem, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCartStore()
  const [showCart, setShowCart] = useState(false)
  const [showShop, setShowShop] = useState(false)

  useEffect(() => {
    async function fetchCookies() {
      try {
        const res = await fetch('/api/cookies?visible=true')
        if (res.ok) {
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          const cookiesList = Array.isArray(data) ? data : data.cookies || []
          const formattedCookies = cookiesList.map((c: any) => ({
            ...c,
            imageUrl: c.imageUrl || (c.image_urls && c.image_urls.length > 0 ? c.image_urls[0] : null) || "/images/cookies/default.jpg"
          }))
          setCookies(formattedCookies)
          setLoading(false)
        } else {
          throw new Error(`Failed to fetch cookies: ${res.status}`)
        }
      } catch (e) {
        console.error("Error fetching cookies, retrying...", e)
        setTimeout(fetchCookies, 3000)
      }
    }
    fetchCookies()
  }, [])

  const getItemQuantity = (cookieId: string) => {
    const item = items.find((i) => i.id === cookieId && !i.isPack)
    return item?.quantity || 0
  }

  const handleShowShop = () => {
    setShowShop(true)
    setTimeout(() => {
      document.getElementById("shop-section")?.scrollIntoView({ behavior: "smooth" })
    }, 50)
  }

  return (
    <div className="min-h-screen bg-[#F8E19A] flex flex-col">
      <NewsBanner />
      <Navbar
        onCartClick={() => setShowCart(!showCart)}
        cartItemCount={getTotalItems()}
      />

      {/* ── Hero / How it works ── */}
      <main className="flex flex-col items-center px-4 py-14 md:py-20 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#930021]/50 mb-3">
          Artisan Cookies · Barcelona
        </p>
        <h1 className="text-5xl md:text-7xl font-black text-[#930021] mb-5 leading-[0.95] tracking-tight">
          Nuestra<br />Tienda
        </h1>
        <p className="text-base md:text-lg text-[#930021]/60 max-w-md mb-12 leading-relaxed font-medium">
          Elige tus galletas artesanales en Barcelona, arma tu pedido y recíbelas en casa o recoge en tienda.
        </p>

        {/* Steps */}
        <div className="w-full max-w-2xl mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Elige tus galletas", desc: "Añade al carrito las galletas o packs que quieras" },
              { step: "2", title: "Completa tu pedido", desc: "Rellena tus datos de entrega o recogida en tienda" },
              { step: "3", title: "Confirmamos por WhatsApp", desc: "Te contactamos para confirmar y coordinar la entrega" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#930021] text-[#F8E19A] flex items-center justify-center text-xl font-bold shadow-md">
                  {step}
                </div>
                <h3 className="font-bold text-[#930021] text-base">{title}</h3>
                <p className="text-sm text-[#930021]/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { icon: Clock, label: "Mínimo 24h de antelación" },
            { icon: MapPin, label: "Entrega en Barcelona" },
            { icon: Phone, label: "Trato directo y personalizado" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-[#930021]/8 border border-[#930021]/15 rounded-full px-4 py-2 text-xs text-[#930021] font-semibold tracking-wide"
            >
              <Icon className="w-3.5 h-3.5 opacity-70" />
              {label}
            </div>
          ))}
        </div>

        <button
          onClick={handleShowShop}
          className="group inline-flex items-center gap-3 bg-[#930021] hover:bg-[#7a001b] text-[#F8E19A] font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Ver productos
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </main>

      {/* ── Shop section ── */}
      {showShop && (
        <div id="shop-section" className="container mx-auto px-4 lg:px-8 py-10 lg:py-16 flex-grow border-t-2 border-[#930021]/10">

          {/* Delivery info banner */}
          <div className="mb-10 bg-white/80 backdrop-blur-sm border border-[#930021]/15 rounded-2xl p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#930021] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="w-5 h-5 text-[#F8E19A]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#930021] mb-2">¿Cómo funcionan las entregas?</h3>
                <ul className="space-y-1.5 text-sm text-[#924C14]/80">
                  <li className="flex items-start gap-2">
                    <span className="text-[#930021] font-bold mt-0.5 leading-none">·</span>
                    <span><strong className="text-[#930021]">Pedidos programados:</strong> Selecciona la fecha y hora de entrega que mejor te convenga (mínimo 24h de anticipación)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#930021] font-bold mt-0.5 leading-none">·</span>
                    <span><strong className="text-[#930021]">Confirmación directa:</strong> Te contactaremos por WhatsApp para confirmar tu pedido y coordinar la entrega</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="flex-1">
              <div className="mb-10">
                <h2 className="text-4xl md:text-5xl font-black text-[#930021] tracking-tight mb-1">Nuestra Tienda</h2>
                <p className="text-base text-[#930021]/60 font-medium">
                  Elige tus galletas favoritas o uno de nuestros packs
                </p>
              </div>

              {/* Predefined boxes */}
              <div className="mb-12">
                <BoxesSection />
              </div>

              {/* Cookie grid header */}
              <div className="flex items-end justify-between mb-6 border-b-2 border-[#930021]/10 pb-4">
                <h2 className="text-2xl font-black text-[#930021] tracking-tight">Galletas Individuales</h2>
                {!loading && (
                  <span className="text-xs font-semibold text-[#930021]/40 uppercase tracking-widest">
                    {cookies.length} productos
                  </span>
                )}
              </div>

              {loading ? (
                <CookieSkeletonGrid
                  count={6}
                  variant="catalog"
                  gridClass="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {cookies.map((cookie) => {
                    const quantity = getItemQuantity(cookie.id)
                    return (
                      <div
                        key={cookie.id}
                        className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/5 hover:ring-[#930021]/20"
                      >
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden bg-[#F9F4ED]">
                          <Image
                            src={cookie.imageUrl || "/placeholder.svg?height=500&width=500&query=cookie"}
                            alt={cookie.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Quantity badge */}
                          {quantity > 0 && (
                            <div className="absolute top-3 right-3 bg-[#930021] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-md z-10">
                              {quantity}
                            </div>
                          )}
                          {/* Subtle overlay on hover */}
                          <div className="absolute inset-0 bg-[#930021]/0 group-hover:bg-[#930021]/5 transition-colors duration-300" />
                        </div>

                        {/* Info */}
                        <div className="p-5 flex flex-col flex-1">
                          <h3
                            className="font-bold text-base text-gray-900 leading-tight line-clamp-1 mb-1"
                            title={cookie.name}
                          >
                            {cookie.name}
                          </h3>
                          <p className="text-2xl font-black text-[#930021] mb-5 leading-none">
                            {cookie.price.toFixed(2)}
                            <span className="text-sm font-bold ml-0.5">€</span>
                          </p>

                          <div className="mt-auto">
                            {quantity === 0 ? (
                              <button
                                className="w-full h-11 rounded-xl text-sm font-bold bg-[#930021] hover:bg-[#7a001b] text-white transition-colors flex items-center justify-center gap-2 group/btn"
                                onClick={() => addItem({ id: cookie.id, name: cookie.name, price: cookie.price, imageUrl: cookie.imageUrl })}
                              >
                                <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-200" />
                                Añadir
                              </button>
                            ) : (
                              <div className="flex items-center justify-between bg-[#F8E19A]/60 rounded-xl p-1 w-full border border-[#930021]/10">
                                <button
                                  className="h-9 w-9 bg-white rounded-lg shadow-sm flex items-center justify-center text-[#930021] hover:bg-red-50 transition-colors"
                                  onClick={() => updateQuantity(cookie.id, quantity - 1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-black text-lg text-[#930021] tabular-nums">{quantity}</span>
                                <button
                                  className="h-9 w-9 bg-[#930021] rounded-lg shadow-sm flex items-center justify-center text-white hover:bg-[#7a001b] transition-colors"
                                  onClick={() => updateQuantity(cookie.id, quantity + 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Sticky cart sidebar ── */}
            <div className={`lg:w-[400px] xl:w-[440px] ${showCart ? "fixed inset-0 z-50 lg:relative lg:z-auto" : "hidden lg:block"}`}>
              {showCart && (
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
                  onClick={() => setShowCart(false)}
                />
              )}

              <div className={`${showCart ? "absolute right-0 top-0 bottom-0 w-[88%] max-w-sm animate-slide-left lg:relative lg:animate-none" : ""} lg:sticky lg:top-24`}>
                <Card className="h-full lg:h-auto border border-[#930021]/20 shadow-xl bg-white rounded-2xl overflow-hidden">
                  <CardContent className="p-0 h-full flex flex-col">

                    {/* Cart header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-[#930021]/10">
                      <div>
                        <h2 className="text-xl font-black text-[#930021]">Tu Pedido</h2>
                        {items.length > 0 && (
                          <p className="text-xs text-[#930021]/50 font-medium mt-0.5">{getTotalItems()} {getTotalItems() === 1 ? "artículo" : "artículos"}</p>
                        )}
                      </div>
                      {showCart && (
                        <button
                          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#930021]/10 text-[#930021] transition-colors"
                          onClick={() => setShowCart(false)}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {items.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#F8E19A]/80 flex items-center justify-center mb-4">
                          <ShoppingCart className="w-8 h-8 text-[#930021]/50" />
                        </div>
                        <p className="text-sm font-bold text-[#930021] mb-1">Carrito vacío</p>
                        <p className="text-xs text-[#930021]/50 text-center leading-relaxed">
                          Agrega tus galletas favoritas para comenzar
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Cart items */}
                        <div className="flex-1 space-y-2 py-4 px-4 overflow-y-auto max-h-[calc(100vh-24rem)] lg:max-h-[420px] scrollbar-elegant">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-3 p-3 rounded-xl bg-[#F8E19A]/25 border border-[#930021]/8 hover:border-[#930021]/20 transition-colors group/item"
                            >
                              <div className="w-16 h-16 bg-[#F9F4ED] rounded-lg relative overflow-hidden flex-shrink-0">
                                <Image
                                  src={item.imageUrl || "/placeholder.svg?height=64&width=64"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm leading-snug text-[#930021] line-clamp-2 mb-1">{item.name}</h4>
                                <p className="text-xs text-[#930021]/50 mb-0.5">€{item.price.toFixed(2)} × {item.quantity}</p>
                                <p className="font-black text-base text-[#930021]">€{(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                              <button
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover/item:opacity-100 hover:bg-red-50 text-[#930021]/40 hover:text-red-600 transition-all"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Totals */}
                        <div className="px-5 py-4 border-t border-[#930021]/10 bg-white space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-[#930021]/60 font-medium">Subtotal</span>
                            <span className="font-semibold text-[#930021]">€{getTotalPrice().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-[#930021]/10">
                            <span className="font-black text-base text-[#930021]">Total</span>
                            <span className="font-black text-xl text-[#930021]">€{getTotalPrice().toFixed(2)}</span>
                          </div>

                          <Button
                            asChild
                            className="w-full mt-1 h-12 text-sm font-bold tracking-wide bg-[#930021] hover:bg-[#7a001b] text-[#F8E19A] rounded-xl shadow-md hover:shadow-lg transition-all"
                            size="lg"
                          >
                            <Link href="/tienda/checkout">
                              Realizar Pedido
                              <ShoppingCart className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}