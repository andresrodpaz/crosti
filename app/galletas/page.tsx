"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ArrowLeft, Menu, X, ShoppingBag } from "lucide-react"
import { CookieDetailModal } from "@/components/cookie-detail-modal"
import Link from "next/link"
import { Footer } from "@/components/footer"
import Image from "next/image"

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

interface Tag {
  id: string
  name: string
  color_hex: string
}

export default function GalletasPage() {
  const [cookies, setCookies] = useState<CookieItem[]>([])
  const [filteredCookies, setFilteredCookies] = useState<CookieItem[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedCookie, setSelectedCookie] = useState<CookieItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredCookie, setHoveredCookie] = useState<string | null>(null)

  const scrollToSection = (sectionId: string) => {
    window.location.href = `/#${sectionId}`
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [tagsRes, cookiesRes] = await Promise.all([fetch("/api/tags"), fetch("/api/cookies?visible=true")])

      const tagsData = await tagsRes.json()
      const cookiesData = await cookiesRes.json()

      setTags(tagsData)
      setCookies(cookiesData)
      setFilteredCookies(cookiesData)
    } catch (error) {
      console.error("Error loading data:", error)
    }
    setIsLoading(false)
  }

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

  useEffect(() => {
    setVisibleCards(new Set())
    const timer = setTimeout(() => {
      filteredCookies.forEach((cookie, index) => {
        setTimeout(() => {
          setVisibleCards((prev) => new Set(prev).add(cookie.id))
        }, index * 50)
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [filteredCookies])

  const toggleTagFilter = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FEFCF5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#930021]/20 border-t-[#930021] rounded-full animate-spin"></div>
          <p className="text-[#930021]/70 font-medium">Cargando galletas deliciosas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FEFCF5] flex flex-col">
      {/* Header */}
      <header className="bg-[#F8E19A] py-6 px-4 md:px-8 lg:px-16 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-[#F8E19A]/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <Image
              src="/images/crosti-logo-transparent.png"
              alt="Crosti Cookies Logo"
              width={180}
              height={80}
              className="h-14 md:h-16 lg:h-20 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
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
            <Link
              href="/galletas"
              className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium border-b-2 border-[#930021]"
            >
              Galletas
            </Link>
            <button
              onClick={() => scrollToSection("contacto")}
              className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium"
            >
              Contacto
            </button>
            <Link
              href="/tienda"
              className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Tienda
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#930021] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[#930021]/10">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-[#930021] text-lg font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <button
                onClick={() => scrollToSection("nosotros")}
                className="text-[#930021] text-lg font-medium py-2 text-left"
              >
                Nosotros
              </button>
              <Link
                href="/galletas"
                className="text-[#930021] text-lg font-bold py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Galletas
              </Link>
              <button
                onClick={() => scrollToSection("contacto")}
                className="text-[#930021] text-lg font-medium py-2 text-left"
              >
                Contacto
              </button>
              <Link
                href="/tienda"
                className="text-[#930021] text-lg font-medium py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingBag className="w-5 h-5" />
                Tienda
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-8 lg:px-16 py-12 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#930021] hover:opacity-80 transition-all hover:gap-3 mb-6 text-sm font-medium group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Volver a inicio
        </Link>

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
                <div className="bg-white aspect-[4/5] max-h-[280px] rounded-t-3xl border border-gray-200 flex items-center justify-center relative overflow-hidden group-hover:border-[#930021]/30 transition-colors">
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
                      {cookie.tags.length > 2 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800/70 text-white backdrop-blur-sm">
                          +{cookie.tags.length - 2}
                        </span>
                      )}
                    </div>
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
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
      </main>

      <Footer />

      {selectedCookie && <CookieDetailModal cookie={selectedCookie} onClose={() => setSelectedCookie(null)} />}
    </div>
  )
}
