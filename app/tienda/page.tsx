import { Footer } from "@/components/footer"
import { getCookies } from "@/lib/cookies-store"
import { useCartStore } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Minus, Plus, Trash2, X, Menu, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ShoppingBag } from "lucide-react"
import { PackBuilderModal } from "@/components/pack-builder-modal"
import { NewsBanner } from "@/components/news-banner"
import { BoxesSection } from "@/components/boxes-section"

export default function TiendaPage() {
  const [cookies, setCookies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { items, addItem, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCartStore()
  const [showCart, setShowCart] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showPackBuilder, setShowPackBuilder] = useState(false)

  useEffect(() => {
    async function fetchCookies() {
      try {
        const res = await fetch('/api/cookies')
        if (res.ok) {
          const data = await res.json()
          // API returns array on success, but object with 'cookies' on error/loading states sometimes
          const cookiesList = Array.isArray(data) ? data : data.cookies || []
          
          // Map DB snake_case to component camelCase if needed, specifically for images
          const formattedCookies = cookiesList.map((c: any) => ({
            ...c,
            imageUrl: c.imageUrl || (c.image_urls && c.image_urls.length > 0 ? c.image_urls[0] : null) || "/images/cookies/default.jpg"
          }))
          
          setCookies(formattedCookies)
        } else {
             console.error("Failed to fetch cookies")
        }
      } catch (e) {
        console.error("Error fetching cookies", e)
      } finally {
        setLoading(false)
      }
    }
    fetchCookies()
  }, [])

  const getItemQuantity = (cookieId: string) => {
    const item = items.find((i) => i.id === cookieId && !i.isPack)
    return item?.quantity || 0
  }

  const scrollToSection = (sectionId: string) => {
    window.location.href = `/#${sectionId}`
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#F8E19A] flex flex-col">
      <NewsBanner />
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

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden relative text-[#930021] hover:text-[#930021] hover:bg-[#930021]/10 h-12 w-12"
            onClick={() => setShowCart(!showCart)}
          >
            <ShoppingCart className="w-6 h-6" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#930021] text-[#F8E19A] w-6 h-6 rounded-full text-sm flex items-center justify-center font-bold shadow-lg">
                {getTotalItems()}
              </span>
            )}
          </Button>

          <button
            className="md:hidden text-[#930021] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
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

      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16 flex-grow">
        <div className="mb-12 bg-white border-2 border-[#930021]/20 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#930021] rounded-full flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-[#F8E19A]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#930021] mb-2">¿Cómo funcionan las entregas?</h3>
              <ul className="space-y-2 text-[#924C14]">
                <li className="flex items-start gap-2">
                  <span className="text-[#930021] font-bold mt-1">•</span>
                  <span>
                    <strong>Pedidos programados:</strong> Selecciona la fecha y hora de entrega que mejor te convenga
                    (mínimo 24h de anticipación)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#930021] font-bold mt-1">•</span>
                  <span>
                    <strong>Sin seguimiento:</strong> Te contactaremos por WhatsApp para confirmar tu pedido y coordinar
                    la entrega
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex-1">
            <div className="mb-16">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#930021] mb-4">Nuestra Tienda</h1>
              <p className="text-lg md:text-xl text-[#930021]/80">
                Elige tus galletas favoritas o arma tu pack personalizado
              </p>
            </div>

            <div className="mb-12">
              <Card className="border-2 border-[#930021] bg-gradient-to-br from-[#930021] to-[#b8002e] text-white overflow-hidden hover:shadow-2xl transition-all cursor-pointer group">
                <CardContent className="p-6" onClick={() => setShowPackBuilder(true)}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all">
                      <Package className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-1">Arma tu Pack Personalizado</h3>
                      <p className="text-sm text-white/90">Elige los sabores que quieras y ahorra en tu compra</p>
                    </div>
                    <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cajas Predefinidas */}
            <div className="mb-12">
                <BoxesSection />
            </div>

            <h2 className="text-3xl font-bold text-[#930021] mb-6">Galletas Individuales</h2>
            
            {loading ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-[#930021] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#930021]">Cargando galletas...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10">
              {cookies.map((cookie) => {
                const quantity = getItemQuantity(cookie.id)
                return (
                  <Card
                    key={cookie.id}
                    className="group overflow-hidden border-2 border-[#930021]/20 hover:border-[#930021] transition-all duration-300 hover:shadow-2xl bg-white hover:-translate-y-1"
                  >
                    <div className="aspect-square bg-gradient-to-br from-[#F8E19A]/20 to-[#F8E19A]/40 relative overflow-hidden">
                      <Image
                        src={cookie.imageUrl || "/placeholder.svg?height=400&width=400&query=artisan cookie"}
                        alt={cookie.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {quantity > 0 && (
                        <div className="absolute top-2 right-2 bg-[#930021] text-[#F8E19A] px-2 py-1 rounded-full text-xs font-bold shadow-lg ring-2 ring-white">
                          {quantity} en carrito
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-base lg:text-lg mb-2 text-[#930021] min-h-[2.5rem] leading-tight line-clamp-2">
                        {cookie.name}
                      </h3>
                      <div className="flex items-baseline justify-between mb-3">
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl lg:text-3xl font-bold text-[#930021]">{cookie.price.toFixed(2)}</p>
                          <span className="text-base text-[#930021]/70">€</span>
                        </div>
                      </div>

                      {quantity === 0 ? (
                        <Button
                          className="w-full h-10 text-sm font-semibold shadow-md hover:shadow-xl transition-all bg-[#930021] hover:bg-[#930021]/90 text-[#F8E19A] group"
                          onClick={() =>
                            addItem({
                              id: cookie.id,
                              name: cookie.name,
                              price: cookie.price,
                              imageUrl: cookie.imageUrl,
                            })
                          }
                        >
                          <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          Agregar al carrito
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 w-full bg-[#F8E19A]/30 rounded-lg p-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-[#930021] hover:text-[#F8E19A] text-[#930021] transition-all"
                              onClick={() => updateQuantity(cookie.id, quantity - 1)}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <div className="flex-1 text-center">
                              <span className="text-xl font-bold text-[#930021]">{quantity}</span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-[#930021] hover:text-[#F8E19A] text-[#930021] transition-all"
                              onClick={() => updateQuantity(cookie.id, quantity + 1)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <p className="text-center text-xs text-[#930021]/70">
                            Subtotal:{" "}
                            <span className="font-bold text-[#930021]">€{(cookie.price * quantity).toFixed(2)}</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            )}
          </div>

          <div
            className={`lg:w-[420px] xl:w-[460px] ${showCart ? "fixed inset-0 z-50 lg:relative lg:z-auto" : "hidden lg:block"}`}
          >
            {showCart && (
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
                onClick={() => setShowCart(false)}
              />
            )}

            <div
              className={`${
                showCart
                  ? "absolute right-0 top-0 bottom-0 w-[90%] max-w-md animate-slide-left lg:relative lg:animate-none"
                  : ""
              } lg:sticky lg:top-24`}
            >
              <Card className="h-full lg:h-auto border-2 border-[#930021]/30 shadow-2xl bg-white">
                <CardContent className="p-5 lg:p-7 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl lg:text-3xl font-bold text-[#930021]">Tu Pedido</h2>
                    {showCart && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="lg:hidden text-[#930021] hover:text-[#930021]"
                        onClick={() => setShowCart(false)}
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    )}
                  </div>

                  {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                      <div className="w-20 h-20 rounded-full bg-[#F8E19A]/50 flex items-center justify-center mb-5">
                        <ShoppingCart className="w-10 h-10 text-[#930021]/60" />
                      </div>
                      <p className="text-lg font-medium text-[#930021] mb-2">Tu carrito está vacío</p>
                      <p className="text-sm text-[#930021]/70 text-center px-4">
                        Agrega tus galletas favoritas para comenzar
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 space-y-3 mb-5 overflow-y-auto max-h-[calc(100vh-24rem)] lg:max-h-[460px] pr-2 scrollbar-elegant">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 p-4 rounded-xl bg-[#F8E19A]/30 border border-[#930021]/10 hover:border-[#930021]/30 transition-all"
                          >
                            <div className="w-20 h-20 bg-white rounded-lg relative overflow-hidden flex-shrink-0 border border-[#930021]/20">
                              <Image
                                src={item.imageUrl || "/placeholder.svg?height=80&width=80&query=cookie"}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base leading-snug mb-1 text-[#930021] line-clamp-2">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-[#930021]/70 mb-1">
                                <span>€{item.price.toFixed(2)}</span>
                                <span>×</span>
                                <span className="font-medium text-[#930021]">{item.quantity}</span>
                              </div>
                              <p className="font-bold text-lg text-[#930021]">
                                €{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex-shrink-0 hover:bg-red-100 hover:text-red-600 text-[#930021]/60 h-9 w-9"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="border-t-2 border-[#930021]/20 pt-4 space-y-3">
                        <div className="flex justify-between items-center text-base">
                          <span className="text-[#930021]/70">Subtotal</span>
                          <span className="font-semibold text-[#930021]">€{getTotalPrice().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-bold pt-3 border-t-2 border-[#930021]/20">
                          <span className="text-[#930021]">Total</span>
                          <span className="text-[#930021]">€{getTotalPrice().toFixed(2)}</span>
                        </div>
                      </div>

                      <Button
                        asChild
                        className="w-full mt-5 h-13 text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-[#930021] hover:bg-[#930021]/90 text-[#F8E19A]"
                        size="lg"
                      >
                        <Link href="/tienda/checkout">
                          Realizar Pedido
                          <ShoppingCart className="w-5 h-5 ml-2" />
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <PackBuilderModal open={showPackBuilder} onClose={() => setShowPackBuilder(false)} />
    </div>
  )
}
