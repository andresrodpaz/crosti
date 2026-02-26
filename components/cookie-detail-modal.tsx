"use client"

import { X } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

export interface CookieItem {
  id: string
  name: string
  description: string
  price: number
  ingredients: string[]
  image_urls: string[]
  main_image_index: number
  tags: { id: string; name: string; color_hex: string }[]
}

type CookieDetailModalProps = {
  cookie: CookieItem
  onClose: () => void
}

export function CookieDetailModal({ cookie, onClose }: CookieDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(cookie.main_image_index || 0)
  const [isVisible, setIsVisible] = useState(false)
  const images = cookie.image_urls || []

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-none md:rounded-3xl w-full h-full md:h-[90vh] md:max-w-5xl overflow-hidden relative shadow-2xl transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2 md:p-2.5 bg-white/95 backdrop-blur-sm rounded-full text-gray-600 hover:text-[#930021] hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <div className="flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden">
          {/* Left side - Image Gallery */}
          <div className="w-full md:w-1/2 bg-[#FAF7F2] relative flex flex-col min-h-[50vh] md:min-h-0">
            {/* Tags */}
            {cookie.tags.length > 0 && (
              <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
                {cookie.tags.slice(0, 1).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs font-bold text-white backdrop-blur-md shadow-md uppercase tracking-wider"
                    style={{ backgroundColor: tag.color_hex }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Main Photo */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
              {images.length > 0 ? (
                <div className="relative w-full h-full">
                  <Image
                    src={images[currentImageIndex] || "/placeholder.svg"}
                    alt={cookie.name}
                    fill
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="text-gray-300 text-center">
                  <svg
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm">Sin imagen disponible</p>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="bg-white border-t border-[#F0EBE6] p-3 md:p-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-[#930021] opacity-100 scale-105"
                          : "border-transparent opacity-60 hover:opacity-80 hover:border-[#F0EBE6]"
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image src={img || "/placeholder.svg"} alt="" fill className="object-cover" loading="lazy" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Details */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col justify-start md:justify-center">
              {/* Title */}
              <h2 className="font-serif text-3xl md:text-5xl mb-2 text-[#930021] leading-tight">{cookie.name}</h2>

              {/* Price */}
              <p className="text-2xl md:text-3xl text-[#924c14] mb-6 md:mb-8 font-light">{cookie.price.toFixed(2)}€</p>

              {/* Description */}
              <p className="text-[#3D2B1F] leading-relaxed mb-6 md:mb-8 text-sm md:text-base">{cookie.description}</p>

              {/* Ingredients */}
              {cookie.ingredients && cookie.ingredients.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#924c14] mb-3 font-bold">Ingredientes</div>
                  <div className="text-[#3D2B1F] text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                    <p className="mb-3 md:mb-4">
                      <strong className="text-[#930021]">Ingredientes generales:</strong>{" "}
                      {cookie.ingredients.join(", ")}
                    </p>
                  </div>
                  <p className="text-[#6B635F] text-xs md:text-sm italic border-t border-[#F0EBE6] pt-4 md:pt-6">
                    <strong className="text-[#930021]">Aviso de alérgenos:</strong> nuestras galletas pueden contener
                    soja, huevos, frutos secos, cacahuetes o productos lácteos. Hacemos todo lo posible para evitar la
                    contaminación cruzada, pero no podemos garantizarla.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
