"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CookieDetailModal } from "./cookie-detail-modal"
import Link from "next/link"

interface CookieItem {
  id: string
  name: string
  description: string
  price: number
  ingredients: string[]
  image_urls: string[]
  main_image_index: number
  is_visible: boolean
  in_carousel: boolean
  carousel_order: number
  tags: { id: string; name: string; color_hex: string }[]
}

const COOKIE_IMAGE_SIZE = {
  width: 400,
  height: 500,
  aspectRatio: "aspect-[4/5]"
}

export function CookiesSection() {
  const [currentPage, setCurrentPage] = useState(0)
  const [cookies, setCookies] = useState<CookieItem[]>([])
  const [selectedCookie, setSelectedCookie] = useState<CookieItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set())

  const itemsPerPage = 3

  useEffect(() => {
    loadCarouselCookies()
  }, [])

  useEffect(() => {
    if (cookies.length > 0) {
      setVisibleCards(new Set())
      const startIndex = currentPage * itemsPerPage
      const endIndex = Math.min(startIndex + itemsPerPage, cookies.length)

      for (let i = startIndex; i < endIndex; i++) {
        setTimeout(
          () => {
            setVisibleCards((prev) => new Set(prev).add(cookies[i].id))
          },
          (i - startIndex) * 100,
        )
      }
    }
  }, [currentPage, cookies, itemsPerPage])

  async function loadCarouselCookies() {
    try {
      const res = await fetch("/api/cookies?carousel=true")

      if (!res.ok) {
        let errorData
        try {
          errorData = await res.json()
        } catch (jsonError) {
          console.error("[Message] Failed to parse error response as JSON")
          errorData = { error: "Server error", hint: "Check console for details" }
        }

        console.error("[Message] ❌ Error loading cookies: API returned", res.status)

        if (res.status === 503) {
          console.error("[Message] 🔧 DATABASE NOT INITIALIZED!")
          console.error("[Message] 📝 Solution: Run the SQL scripts from the scripts/ folder:")
          console.error("[Message]    1. scripts/001_create_tables.sql")
          console.error("[Message]    2. scripts/002_seed_initial_data.sql")
          console.error("[Message]    3. scripts/003_enable_rls.sql")
        }

        console.error("[Message] Error details:", errorData)
        setCookies([])
        return
      }

      const data = await res.json()
      setCookies(Array.isArray(data) ? data : data.cookies || [])
    } catch (error) {
      console.error("[Message] Unexpected error loading cookies:", error)
      setCookies([])
    }
    setIsLoading(false)
  }

  const totalPages = Math.ceil(cookies.length / itemsPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const getVisibleCookies = () => {
    if (cookies.length === 0) return []

    const startIndex = currentPage * itemsPerPage
    const visibleCookies: CookieItem[] = []

    for (let i = 0; i < itemsPerPage; i++) {
      const index = (startIndex + i) % cookies.length
      visibleCookies.push(cookies[index])
    }

    return visibleCookies
  }

  const visibleCookies = getVisibleCookies()
  const [hoveredCookie, setHoveredCookie] = useState<string | null>(null)

  const getHoverImage = (cookie: CookieItem) => {
    const mainIndex = cookie.main_image_index || 0
    const images = cookie.image_urls || []
    if (images.length > 1) {
      // Return second image if available, otherwise next available
      const hoverIndex = mainIndex === 0 ? 1 : 0
      return images[hoverIndex] || images[mainIndex]
    }
    return images[mainIndex]
  }

  if (isLoading) {
    return (
      <section id="galletas" className="bg-[#FFF3E2] py-16 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#930021]/20 border-t-[#930021] rounded-full animate-spin"></div>
            <p className="text-[#930021]/70 font-medium">Cargando galletas deliciosas...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="galletas" className="bg-[#FFF3E2] py-16 px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-[#930021] mb-4">Nuestras galletas</h2>
          <p className="text-[#930021]/80 text-sm">Haz clic para ver ingredientes y detalles</p>
        </div>

        <div className="relative">
          {totalPages > 1 && (
            <>
              <button
                onClick={prevPage}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 bg-white rounded-full shadow-lg text-[#930021] hover:bg-[#930021] hover:text-white transition-all hover:scale-110 active:scale-95"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextPage}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 bg-white rounded-full shadow-lg text-[#930021] hover:bg-[#930021] hover:text-white transition-all hover:scale-110 active:scale-95"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
            {visibleCookies.map((cookie, idx) => {
              const mainImage = cookie.image_urls?.[cookie.main_image_index] || cookie.image_urls?.[0]
              const hoverImage = getHoverImage(cookie)
              const isVisible = visibleCards.has(cookie.id)
              const isHovered = hoveredCookie === cookie.id
              const hasMultipleImages = (cookie.image_urls?.length || 0) > 1

              return (
                <div
                  key={`${cookie.id}-${idx}`}
                  className={`rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  onClick={() => setSelectedCookie(cookie)}
                  onMouseEnter={() => setHoveredCookie(cookie.id)}
                  onMouseLeave={() => setHoveredCookie(null)}
                >
                  <div className="bg-white aspect-[4/5] rounded-t-3xl border border-gray-200 flex items-center justify-center relative overflow-hidden group-hover:border-[#930021]/30 transition-colors">
                    {cookie.tags.length > 0 && (
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
                        {cookie.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white backdrop-blur-sm shadow-sm"
                            style={{ backgroundColor: tag.color_hex }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {mainImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={mainImage || "/placeholder.svg"}
                          alt={cookie.name}
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                            isHovered && hasMultipleImages ? "opacity-0 scale-105" : "opacity-100 scale-100"
                          }`}
                          loading="lazy"
                        />
                        {hasMultipleImages && (
                          <img
                            src={hoverImage || "/placeholder.svg"}
                            alt={`${cookie.name} - alternativa`}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            }`}
                            loading="lazy"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-300 text-center">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xs">Imagen</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-[#F5DFA0] p-6 rounded-b-3xl group-hover:bg-[#F9E7AE] transition-colors">
                    <h3 className="text-[#930021] font-semibold text-center mb-1 text-sm">{cookie.name}</h3>
                    <p className="text-[#930021] font-bold text-center mb-4 text-lg">{cookie.price.toFixed(2)}€</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCookie(cookie)
                      }}
                      className="w-full py-3 px-6 border-2 border-[#930021] rounded-full text-[#930021] font-medium text-sm hover:bg-[#930021] hover:text-[#F9E7AE] transition-all active:scale-95"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentPage ? "bg-[#930021] w-8" : "bg-[#930021]/30 hover:bg-[#930021]/50"
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/galletas"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#930021] text-[#F9E7AE] rounded-full font-medium hover:bg-[#7a001b] transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Ver todas las galletas
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {selectedCookie && <CookieDetailModal cookie={selectedCookie} onClose={() => setSelectedCookie(null)} />}
    </section>
  )
}
