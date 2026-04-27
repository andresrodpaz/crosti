"use client"

import { useState, useEffect } from "react"
import { Search, Filter } from "lucide-react"
import { CookieDetailModal } from "./cookie-detail-modal"
import Link from "next/link"
import Image from "next/image"
import { StampBadge } from "@/components/stamp-badge"

interface CookieItem {
  id: string
  name: string
  description: string
  price: number
  ingredients: string[]
  image_urls: string[]
  main_image_index: number
  is_visible: boolean
  tags: { id: string; name: string; color_hex: string }[]
  badge?: { text?: string; bg_color?: string; text_color?: string; visible?: boolean }
}

interface Tag {
  id: string
  name: string
  color_hex: string
}

const getHoverImage = (cookie: CookieItem) => {
  const mainIndex = cookie.main_image_index || 0
  const images = cookie.image_urls || []
  if (images.length > 1) {
    const hoverIndex = mainIndex === 0 ? 1 : 0
    return images[hoverIndex] || images[mainIndex]
  }
  return images[mainIndex]
}

interface Props {
  initialCookies: CookieItem[]
  initialTags: Tag[]
}

export function CookiesCatalog({ initialCookies, initialTags }: Props) {
  const [cookies, setCookies] = useState<CookieItem[]>(initialCookies)
  const [filteredCookies, setFilteredCookies] = useState<CookieItem[]>(initialCookies)
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [selectedCookie, setSelectedCookie] = useState<CookieItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set())
  const [hoveredCookie, setHoveredCookie] = useState<string | null>(null)

  // Filtering logic stays the same
  useEffect(() => {
    let result = cookies

    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedTags.length > 0) {
      result = result.filter((c) => selectedTags.some((tagId) => c.tags.some((t) => t.id === tagId)))
    }

    setFilteredCookies(result)
  }, [searchTerm, selectedTags, cookies])

  // animation still but faster
  useEffect(() => {
    setVisibleCards(new Set())
    const timer = setTimeout(() => {
      filteredCookies.forEach((cookie, index) => {
        setTimeout(() => {
          setVisibleCards((prev) => new Set(prev).add(cookie.id))
        }, index * 30) // reduced from 50
      })
    }, 20)
    return () => clearTimeout(timer)
  }, [filteredCookies])

  const toggleTagFilter = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]))
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto px-8 lg:px-16 py-12 w-full">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold text-[#930021] mb-4">Todas nuestras galletas</h1>
        <p className="text-[#930021]/80">Descubre nuestra variedad de sabores artesanales</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#930021]/40 group-focus-within:text-[#930021] transition-colors" />
          <input
            type="text"
            placeholder="Buscar galletas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-[#930021]/20 bg-white text-[#930021] placeholder:text-[#930021]/40 focus:outline-none focus:border-[#930021] focus:ring-2 focus:ring-[#930021]/10 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all hover:scale-105 active:scale-95 ${
            showFilters || selectedTags.length > 0
              ? "bg-[#930021] text-[#F9E7AE] border-[#930021] shadow-md"
              : "border-[#930021]/20 text-[#930021] hover:border-[#930021]"
          }`}
        >
          <Filter className="w-5 h-5" />
          Filtros
          {selectedTags.length > 0 && (
            <span className="bg-[#F9E7AE] text-[#930021] w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium">
              {selectedTags.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Tags */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-6 mb-8 border border-[#930021]/10 shadow-sm animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[#930021]">Filtrar por etiqueta</h3>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm text-[#930021]/60 hover:text-[#930021] transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTagFilter(tag.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTags.includes(tag.id)
                    ? "text-white scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color_hex } : {}}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <p className="text-[#930021]/60 text-sm mb-6">
        {filteredCookies.length} {filteredCookies.length === 1 ? "galleta encontrada" : "galletas encontradas"}
      </p>

      {/* Cookie Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCookies.map((cookie) => {
          const mainImage = cookie.image_urls?.[cookie.main_image_index] || cookie.image_urls?.[0]
          const hoverImage = getHoverImage(cookie)
          const isVisible = visibleCards.has(cookie.id)
          const isHovered = hoveredCookie === cookie.id
          const hasMultipleImages = (cookie.image_urls?.length || 0) > 1

          return (
            <div
              key={cookie.id}
              className={`rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              onClick={() => setSelectedCookie(cookie)}
              onMouseEnter={() => setHoveredCookie(cookie.id)}
              onMouseLeave={() => setHoveredCookie(null)}
            >
              {/* Image */}
              <div className="
                bg-white aspect-square rounded-t-3xl border border-gray-200 flex items-center justify-center relative overflow-hidden group-hover:border-[#930021]/30 transition-colors
                ">
                {cookie.badge?.visible && cookie.badge.text && (
                  <StampBadge
                    text={cookie.badge.text}
                    bgColor={cookie.badge.bg_color}
                    textColor={cookie.badge.text_color}
                  />
                )}
                {mainImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={mainImage || "/placeholder.svg"}
                      alt={cookie.name}
                      className={`absolute inset-0 w-full h-full object-cover rounded-t-3xl transition-all duration-500 ${
                        isHovered && hasMultipleImages ? "opacity-0 scale-105" : "opacity-100 scale-100"
                      }`}
                      loading="lazy"
                    />
                    {hasMultipleImages && (
                      <img
                        src={hoverImage || "/placeholder.svg"}
                        alt={`${cookie.name} - alternativa`}
                        className={`absolute inset-0 w-full h-full object-cover rounded-t-3xl transition-all duration-500 ${
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xs">Imagen</p>
                  </div>
                )}
              </div>
              {/* Card content */}
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

      {filteredCookies.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 bg-[#930021]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[#930021]/40" />
          </div>
          <h3 className="text-[#930021] font-medium mb-2">No se encontraron galletas</h3>
          <p className="text-[#930021]/60 text-sm">Intenta con otros términos de búsqueda o filtros</p>
        </div>
      )}

      {selectedCookie && <CookieDetailModal cookie={selectedCookie} onClose={() => setSelectedCookie(null)} />}
    </main>
  )
}