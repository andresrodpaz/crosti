"use client"

import { X } from "lucide-react"
import { useState, useEffect } from "react"
import type { CookieItem } from "@/lib/store"

type CookieDetailModalProps = {
  cookie: CookieItem
  onClose: () => void
}

export function CookieDetailModal({ cookie, onClose }: CookieDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(cookie.mainImageIndex || 0)
  const [isVisible, setIsVisible] = useState(false)
  const images = cookie.imageUrls || []

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  const updateView = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-3xl w-full max-w-[900px] h-[580px] overflow-hidden relative shadow-2xl transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-20 p-2 bg-white/95 backdrop-blur-sm rounded-full text-gray-600 hover:text-[#930021] hover:bg-white transition-all shadow-lg hover:shadow-xl"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex h-full">
          <div className="flex-1 relative bg-[#faf7f2] flex flex-col">
            {cookie.tags.length > 0 && (
              <div className="absolute top-6 left-6 z-10">
                <div
                  className="bg-white/95 px-4 py-2 rounded-xl text-xs font-bold uppercase shadow-md"
                  style={{ color: cookie.tags[0].color }}
                >
                  {cookie.tags[0].name}
                </div>
              </div>
            )}

            <div className="flex-1 flex items-center justify-center p-8">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex] || "/placeholder.svg"}
                  alt={cookie.name}
                  className="w-full h-full object-contain max-h-[400px]"
                />
              ) : (
                <div className="text-gray-300 text-center">
                  <p className="text-sm">Sin imagen</p>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex h-[90px] bg-white border-t border-[#f0ebe6]">
                {images.slice(0, 3).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => updateView(index)}
                    className={`flex-1 cursor-pointer border-r border-[#f0ebe6] last:border-r-0 hover:opacity-80 transition-opacity ${
                      index === currentImageIndex ? "ring-2 ring-[#930021] ring-inset" : ""
                    }`}
                  >
                    <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 p-12 flex flex-col justify-center overflow-y-auto">
            <h2 className="font-serif italic text-5xl mb-2 text-[#3d2b1f]">{cookie.name}</h2>
            <p className="text-3xl text-[#a67c52] font-light mb-6">€{cookie.price.toFixed(2)}</p>

            <p className="text-[#6b635f] leading-relaxed text-base mb-8">{cookie.description}</p>

            {cookie.ingredients && cookie.ingredients.length > 0 && (
              <div>
                <span className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3 block">
                  Ingredientes
                </span>
                <div className="text-sm leading-relaxed text-[#3d2b1f]">
                  <p className="mb-4">
                    <strong>Ingredientes generales:</strong> {cookie.ingredients.join(", ")}
                  </p>
                  <p className="text-[#6b635f] italic border-t border-[#f0ebe6] pt-4">
                    <strong>Aviso de alérgenos:</strong> nuestras galletas pueden contener soja, huevos, frutos secos o
                    productos lácteos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
