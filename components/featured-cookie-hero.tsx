"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface FeaturedCookie {
  id: string
  name: string
  description: string
  price: number
  image_urls: string[]
  custom_description?: string
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

  useEffect(() => {
    fetch("/api/featured-cookie", { cache: "no-store" })
      .then(r => r.json())
      .then(data => setCookie(data))
      .catch(err => console.error("Error loading featured cookie:", err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <FeaturedCookieSkeleton />
  if (!cookie) return null

  const descText = cookie.custom_description || cookie.description
  const imageUrl = cookie.image_urls?.[0] || null

  const BadgeSvg = ({ className }: { className: string }) => (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <polygon
        points="50,2 61,18 79,10 79,30 98,33 88,50 98,67 79,70 79,90 61,82 50,98 39,82 21,90 21,70 2,67 12,50 2,33 21,30 21,10 39,18"
        fill="#8B0F2B"
      />
      <text x="50" y="40" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fontWeight="700" fill="#F5D78A">Cookie</text>
      <text x="50" y="56" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fontWeight="700" fill="#F5D78A">del</text>
      <text x="50" y="72" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fontWeight="700" fill="#F5D78A">mes</text>
    </svg>
  )

  return (
    <section className="w-full relative">
      <div className="
        grid w-full grid-cols-1
        sm:grid-cols-2 sm:h-[80vh] sm:max-h-none
        md:h-[80vh]
        lg:h-[80vh]
        xl:h-[80vh]
        2xl:h-[80vh] 2xl:max-h-[800px]
      ">

        {/* ── Arriba móvil / Izquierda desktop: imagen ── */}
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

          {/* Badge móvil — esquina superior derecha de la imagen */}
          <div className="absolute top-3 right-3 z-20 sm:hidden">
            <BadgeSvg className="w-[70px] h-[70px] drop-shadow-xl" />
          </div>
        </div>

        {/* ── Abajo móvil / Derecha desktop: contenido ── */}
        <div className="flex flex-col bg-[#f7efe8]
          px-6 py-8
          sm:px-8 sm:py-0 sm:justify-center
          md:px-12
          lg:px-16
          xl:px-20
        ">

          <p className="
            text-[#924C14]/60 font-semibold tracking-[0.25em] uppercase mb-2
            text-[10px] sm:text-[11px] lg:text-xs
          ">
            Galleta del Mes
          </p>

          <h2 className="
            font-black text-[#5A2E0A] leading-[1.05] mb-3
            text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl
          ">
            {cookie.name}
          </h2>

          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-[#924C14]/30" />
            <span className="text-[#924C14]/50 text-xs">✦</span>
            <div className="h-px flex-1 bg-[#924C14]/30" />
          </div>

          <p className="
            text-[#924C14]/80 leading-relaxed max-w-md mb-4
            text-xs sm:text-sm lg:text-base
          ">
            {descText}
          </p>

          <p className="
            font-bold text-[#5A2E0A] mb-6
            text-lg sm:text-xl
          ">
            {cookie.price ? `€${Number(cookie.price).toFixed(2)}` : ""}
          </p>

          {/* Botón: centrado en móvil, alineado izquierda en desktop */}
          <Link
            href="/tienda"
            className="
              inline-flex items-center justify-center rounded-full
              bg-[#924C14] text-[#f7efe8] font-bold tracking-wide
              transition-all hover:bg-[#7a3b0b] hover:scale-[1.02] active:scale-95
              px-7 py-2.5 text-sm
              self-center
              sm:self-start sm:px-8 sm:py-3 sm:text-base
            "
          >
            ¡Pruébala!
          </Link>
        </div>

      </div>

      {/* Badge desktop — centrado entre los dos bloques, oculto en móvil */}
      <div className="
        hidden sm:block
        absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none
        top-[40%]
      ">
        <BadgeSvg className="
          drop-shadow-xl
          sm:w-[100px] sm:h-[100px]
          md:w-[110px] md:h-[110px]
          lg:w-[120px] lg:h-[120px]
        " />
      </div>

    </section>
  )
}