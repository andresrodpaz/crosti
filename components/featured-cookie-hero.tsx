"use client"

import { useEffect, useState } from "react"
import { CookieDetailModal } from "@/components/cookie-detail-modal"

interface StyleConfig {
  font?: string
  titleSize?: string
  badgeText?: string
  badgeColor?: string
  badgeTextColor?: string
  overlayStyle?: "bottom-fade" | "full-dark" | "none"
  overlayOpacity?: number
  textAlign?: "left" | "center"
  accentColor?: string
}

interface FeaturedCookie {
  id: string
  name: string
  description: string
  price: number
  image_urls: string[]
  ingredients?: string[]
  main_image_index?: number
  custom_description?: string
  style_config?: StyleConfig
  tags?: { id: string; name: string; color_hex: string }[]
}

const TITLE_SIZE_CLASS: Record<string, string> = {
  small: "text-xl sm:text-2xl",
  medium: "text-2xl sm:text-3xl",
  large: "text-3xl sm:text-4xl lg:text-5xl",
  xl: "text-4xl sm:text-5xl lg:text-6xl",
}

function FeaturedCookieSkeleton() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 w-full sm:h-[80vh]">
        <div className="w-full h-[65vw] sm:h-full bg-[#e8ddd6] animate-pulse" />
        <div className="flex flex-col justify-center px-8 py-10 gap-4 bg-[#f7efe8]">
          <div className="h-3 w-20 bg-[#DEAD8A] rounded-full animate-pulse" />
          <div className="h-10 w-4/5 bg-[#DEAD8A] rounded-2xl animate-pulse" />
          <div className="h-3 w-full bg-[#DEAD8A] rounded-full animate-pulse" />
          <div className="h-10 w-36 bg-[#C4965A] rounded-full animate-pulse mt-1" />
        </div>
      </div>
    </section>
  )
}

export function FeaturedCookieHero() {
  const [cookie, setCookie] = useState<FeaturedCookie | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch("/api/featured-cookie", { cache: "no-store" })
      .then(r => r.json())
      .then(data => setCookie(data))
      .catch(err => console.error("Error loading featured cookie:", err))
      .finally(() => setLoading(false))
  }, [])

  // Inject Google Font if needed
  useEffect(() => {
    if (!cookie?.style_config?.font) return
    const font = cookie.style_config.font
    if (font.includes("Playfair Display") || font.includes("Lora") || font.includes("Abril Fatface") || font.includes("Raleway") || font.includes("Montserrat") || font.includes("Poppins") || font.includes("Merriweather") || font.includes("Josefin Sans")) {
      const existing = document.querySelector("link[data-crosti-font]")
      if (!existing) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.setAttribute("data-crosti-font", "true")
        link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lora:wght@700&family=Abril+Fatface&family=Raleway:wght@700;900&family=Montserrat:wght@700;900&family=Poppins:wght@700&family=Merriweather:wght@700&family=Josefin+Sans:wght@700&display=swap"
        document.head.appendChild(link)
      }
    }
  }, [cookie])

  if (loading) return <FeaturedCookieSkeleton />
  if (!cookie) return null

  const sc = cookie.style_config || {}
  const descText = cookie.custom_description || cookie.description
  const imageUrl = cookie.image_urls?.[0] || null
  const font = sc.font || "'Georgia', serif"
  const titleSizeClass = TITLE_SIZE_CLASS[sc.titleSize || "large"] || TITLE_SIZE_CLASS.large
  const badgeText = sc.badgeText || "Cookie del Mes"
  const badgeColor = sc.badgeColor || "#8B0F2B"
  const badgeTextColor = sc.badgeTextColor || "#F5D78A"
  const overlayStyle = sc.overlayStyle || "bottom-fade"
  const overlayOpacity = (sc.overlayOpacity ?? 60) / 100
  const textAlign = sc.textAlign || "left"
  const accentColor = sc.accentColor || "#924C14"

  const overlayGradient = (() => {
    if (overlayStyle === "none") return undefined
    if (overlayStyle === "full-dark") return `rgba(0,0,0,${overlayOpacity})`
    return `linear-gradient(to top, rgba(0,0,0,${overlayOpacity}) 0%, transparent 60%)`
  })()



  return (
    <section className="w-full relative">
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 sm:h-[80vh] md:h-[80vh] lg:h-[80vh] xl:h-[80vh] 2xl:h-[80vh] 2xl:max-h-[800px]">

        {/* Image side */}
        <div className="relative w-full overflow-hidden group bg-[#f7efe8] h-[65vw] sm:h-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={cookie.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[#C4965A]" />
          )}

          {/* Overlay */}
          {overlayStyle !== "none" && overlayGradient && (
            <div className="absolute inset-0" style={{ background: overlayGradient }} />
          )}

          {/* Badge mobile */}
          <div className="absolute top-3 right-3 z-20 sm:hidden">
            <img 
              src="/images/galleta-del-mes-banner.png" 
              alt="Galleta del mes"
              className="w-[70px] h-[70px] object-contain drop-shadow-xl" 
            />
          </div>
        </div>

        {/* Content side */}
        <div
          className={`flex flex-col bg-[#f7efe8] px-6 py-8 sm:px-8 sm:py-0 sm:justify-center md:px-12 lg:px-16 xl:px-20 ${textAlign === "center" ? "items-center text-center" : ""}`}
        >
          <p
            className="font-semibold tracking-[0.25em] uppercase mb-2 text-[10px] sm:text-[11px] lg:text-xs"
            style={{ color: `${accentColor}99` }}
          >
            Galleta del Mes
          </p>

          <h2
            className={`font-black leading-[1.05] mb-3 ${titleSizeClass}`}
            style={{ fontFamily: font, color: accentColor }}
          >
            {cookie.name}
          </h2>

          <div className={`flex items-center gap-3 mb-3 ${textAlign === "center" ? "w-full max-w-xs" : ""}`}>
            <div className="h-px flex-1 bg-[#924C14]/30" />
            <span className="text-[#924C14]/50 text-xs">✦</span>
            <div className="h-px flex-1 bg-[#924C14]/30" />
          </div>

          <p
            className="leading-relaxed max-w-md mb-4 text-xs sm:text-sm lg:text-base"
            style={{ color: `${accentColor}cc` }}
          >
            {descText}
          </p>

          <p className="font-bold mb-6 text-lg sm:text-xl" style={{ color: accentColor }}>
            {cookie.price ? `€${Number(cookie.price).toFixed(2)}` : ""}
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-full font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-95 px-7 py-2.5 text-sm self-center sm:self-start sm:px-8 sm:py-3 sm:text-base"
            style={{ backgroundColor: accentColor, color: "#f7efe8" }}
          >
            ¡Pruébala!
          </button>
        </div>
      </div>

      {/* Badge desktop */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none top-[40%]">
        <img 
          src="/images/galleta-del-mes-banner.png" 
          alt="Galleta del mes"
          className="drop-shadow-xl w-[100px] h-[100px] md:w-[110px] md:h-[110px] lg:w-[120px] lg:h-[120px] object-contain" 
        />
      </div>

      {showModal && cookie && (
        <CookieDetailModal
          cookie={{
            id: cookie.id,
            name: cookie.name,
            description: cookie.description,
            price: cookie.price,
            image_urls: cookie.image_urls || [],
            ingredients: cookie.ingredients || [],
            main_image_index: cookie.main_image_index || 0,
            tags: cookie.tags || []
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </section>
  )
}