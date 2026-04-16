"use client"

import { useState, useEffect } from "react"
import { Package, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { useToast } from "@/hooks/use-toast"
import { CookieSkeletonGrid } from "@/components/ui/cookie-skeleton"

interface BoxCookie {
  cookie_id: string
  quantity: number
  cookie?: {
    id: string
    name: string
    image_urls: string[]
    main_image_index: number
  }
}

interface Box {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_visible: boolean
  cookies: BoxCookie[]
}

const getCookieImage = (cookie?: BoxCookie["cookie"]) => {
  if (!cookie || !cookie.image_urls || cookie.image_urls.length === 0) return null
  const index = cookie.main_image_index || 0
  return cookie.image_urls[index] || cookie.image_urls[0]
}

export function BoxesSection() {
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBox, setSelectedBox] = useState<Box | null>(null)
  const { addItem } = useCartStore()
  const { toast } = useToast()

  useEffect(() => {
    fetchBoxes()
  }, [])

  const fetchBoxes = async () => {
    try {
      const res = await fetch("/api/boxes?visible=true")
      if (res.ok) {
        const data = await res.json()
        setBoxes(data.filter((b: Box) => b.is_visible))
      }
    } catch (error) {
      console.error("Error fetching boxes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (box: Box) => {
    addItem({
      id: `box-${box.id}`,
      type: "box",
      name: box.name,
      price: box.price,
      quantity: 1,
      image: box.image_url,
      boxId: box.id,
      boxCookies: box.cookies.map((c) => ({
        cookieId: c.cookie_id,
        cookieName: c.cookie?.name || "Galleta",
        quantity: c.quantity,
      })),
    })
    toast({
      title: "Agregado al carrito",
      description: `${box.name} ha sido agregada al carrito`,
    })
    setSelectedBox(null)
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-[#FDF6E3] to-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header — visible immediately */}
          <div className="text-center mb-12">
            <div className="h-8 w-52 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-36 bg-gray-200 rounded-2xl mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-80 bg-gray-200 rounded-full mx-auto animate-pulse" />
          </div>
          <CookieSkeletonGrid
            count={3}
            variant="box"
            gridClass="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          />
        </div>
      </section>
    )
  }

  if (boxes.length === 0) {
    return null
  }

  return (
    <>
      <section className="py-16 bg-gradient-to-b from-[#FDF6E3] to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#930021]/10 rounded-full text-[#930021] text-sm font-medium mb-4">
              <Package className="w-4 h-4" />
              Cajas Predefinidas
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Nuestras Cajas de Galletas
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Selecciones especiales preparadas con amor. Perfectas para regalar o disfrutar en casa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boxes.map((box) => (
              <div
                key={box.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100"
                onClick={() => setSelectedBox(box)}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {box.image_url ? (
                    <img
                      src={box.image_url || "/placeholder.svg"}
                      alt={box.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1.5 bg-[#930021] text-white text-sm font-bold rounded-full shadow-lg">
                      {box.price.toFixed(2)} EUR
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{box.name}</h3>
                  {box.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{box.description}</p>
                  )}
                  
                  {/* Cookies preview */}
                  {box.cookies.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Contenido:</p>
                      <div className="flex flex-wrap gap-1">
                        {box.cookies.slice(0, 4).map((bc) => (
                          <span
                            key={bc.cookie_id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#F8E19A]/30 text-[#930021] rounded-full text-xs font-medium"
                          >
                            {bc.cookie?.name || "Galleta"} x{bc.quantity}
                          </span>
                        ))}
                        {box.cookies.length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{box.cookies.length - 4} mas
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-[#930021] hover:bg-[#930021]/90 text-[#F8E19A] font-semibold"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(box)
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Agregar al Carrito
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Box Detail Modal */}
      {selectedBox && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBox(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-gray-100">
              {selectedBox.image_url ? (
                <img
                  src={selectedBox.image_url || "/placeholder.svg"}
                  alt={selectedBox.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-gray-300" />
                </div>
              )}
              <button
                onClick={() => setSelectedBox(null)}
                type="button"
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="px-4 py-2 bg-[#930021] text-white text-xl font-bold rounded-full shadow-lg">
                  {selectedBox.price.toFixed(2)} EUR
                </span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBox.name}</h2>
              {selectedBox.description && (
                <p className="text-gray-600 mb-6">{selectedBox.description}</p>
              )}

              {selectedBox.cookies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                    Galletas incluidas
                  </h3>
                  <div className="space-y-2">
                    {selectedBox.cookies.map((bc) => (
                      <div
                        key={bc.cookie_id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        {getCookieImage(bc.cookie) && (
                          <img
                            src={getCookieImage(bc.cookie) || "/placeholder.svg"}
                            alt={bc.cookie?.name || "Galleta"}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{bc.cookie?.name || "Galleta"}</p>
                        </div>
                        <span className="px-3 py-1 bg-[#930021]/10 text-[#930021] rounded-full text-sm font-bold">
                          x{bc.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full h-12 bg-[#930021] hover:bg-[#930021]/90 text-[#F8E19A] font-semibold text-lg"
                onClick={() => handleAddToCart(selectedBox)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Agregar al Carrito - {selectedBox.price.toFixed(2)} EUR
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
