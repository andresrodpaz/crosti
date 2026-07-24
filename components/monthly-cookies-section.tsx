"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import { CookieSkeletonCard, CookieSkeletonGrid } from "@/components/ui/cookie-skeleton"
import { StampBadge } from "@/components/stamp-badge"

export interface CollectionItem {
  cookie: {
    id: string
    name: string
    description: string
    price: number
    image_url: string
    image_urls?: string[]
    ingredients?: string[]
    main_image_index?: number
    badge?: { text?: string; bg_color?: string; text_color?: string; visible?: boolean }
    tags: { id?: string; name: string; color_hex: string }[]
  }
  is_hero: boolean
  custom_tag?: string
}

export interface MonthlyCollection {
  title: string
  subtitle: string
  description?: string
  bg_color: string
  text_color?: string
  title_color?: string
  items: CollectionItem[]
}

import { CookieDetailModal, type CookieItem } from "@/components/cookie-detail-modal"

export function MonthlyCookiesSection({ previewData }: { previewData?: MonthlyCollection | null }) {
  const [collection, setCollection] = useState<MonthlyCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCookie, setSelectedCookie] = useState<CookieItem | null>(null)

  useEffect(() => {
    if (previewData) {
      setCollection(previewData)
      setLoading(false)
      return
    }

    async function loadActiveCollection() {
      try {
        const supabase = createClient()

        // 1. Get active collection — SECCION_GALLETA_DEL_MES has is_active=false so it's naturally excluded
        const { data: collectionData, error } = await supabase
          .from("monthly_collections")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error || !collectionData) {
          console.log("MonthlyCookiesSection: No active collection found", { error, collectionData })
          setLoading(false)
          return
        }

        console.log("MonthlyCookiesSection: Active collection found", collectionData)

        // 2. Get items with cookie details
        const { data: itemsData } = await supabase
          .from("monthly_collection_items")
          .select(`
            is_hero,
            custom_tag,
            display_order,
            cookie:cookies (
              id,
              name,
              description,
              price,
              image_urls,
              ingredients,
              main_image_index
            )
          `)
          .eq("collection_id", collectionData.id)
          .order("display_order")

        if (itemsData) {
          // Helper to ensure image_urls is an array of strings
          const parseImageUrls = (raw: any): string[] => {
            if (Array.isArray(raw)) return raw;
            try { return JSON.parse(raw) || []; } catch { return []; }
          }

          // Map items (filtering out any items with missing/deleted cookie reference)
          const items: CollectionItem[] = itemsData
            .filter((item: any) => item.cookie)
            .map((item: any) => {
              const urls = parseImageUrls(item.cookie.image_urls);
              return {
                is_hero: item.is_hero,
                custom_tag: item.custom_tag,
                cookie: {
                  id: item.cookie.id,
                  name: item.cookie.name || "",
                  description: item.cookie.description || "",
                  price: item.cookie.price || 0,
                  image_url: urls[0] || "",
                  image_urls: urls,
                  ingredients: item.cookie.ingredients || [],
                  main_image_index: item.cookie.main_image_index || 0,
                  badge: undefined,
                  tags: []
                }
              };
            })

          setCollection({
            title: collectionData.title,
            subtitle: collectionData.subtitle,
            description: collectionData.description,
            bg_color: collectionData.bg_color || "#FEFCF5",
            text_color: collectionData.text_color || "#924c14",
            title_color: collectionData.title_color || "#930021",
            items
          })
        }
      } catch (err) {
        console.error("Error loading monthly collection", err)
      } finally {
        setLoading(false)
      }
    }

    if (!previewData) {
      loadActiveCollection()
    }
  }, [previewData])

  if (loading) {
    return (
      <section className="py-20 px-8 lg:px-16 overflow-hidden relative bg-[#FEFCF5]">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header skeleton */}
          <div className="text-center mb-16 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded-full mx-auto animate-pulse" />
            <div className="h-14 w-80 bg-gray-200 rounded-2xl mx-auto animate-pulse" />
            <div className="h-5 w-64 bg-gray-200 rounded-full mx-auto animate-pulse" />
          </div>
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Hero skeleton */}
            <div className="lg:col-span-7">
              <CookieSkeletonCard variant="monthly-hero" />
            </div>
            {/* Side skeleton */}
            <div className="lg:col-span-5">
              <CookieSkeletonGrid count={3} variant="monthly-side" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!collection || collection.items.length === 0) {
    return null
  }

  // Find hero item or default to first
  const heroItem = collection.items.find(i => i.is_hero) || collection.items[0]
  const otherItems = collection.items.filter(i => i !== heroItem).slice(0, 3) // Max 3 others
  const isSingleItem = collection.items.length === 1

  return (
    <section className="py-20 px-8 lg:px-16 overflow-hidden relative" style={{ backgroundColor: collection.bg_color }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#930021]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-[#930021]/10 text-[#930021] text-sm font-semibold tracking-wider mb-4">
            EDICIÓN LIMITADA
          </span>
          <h2
            className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{ color: collection.title_color || "#930021" }}
          >
            {collection.title}
          </h2>
          <p
            className="text-xl md:text-2xl font-medium max-w-2xl mx-auto mb-4"
            style={{ color: collection.text_color || "#924c14" }}
          >
            {collection.subtitle}
          </p>
          {collection.description && (
            <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: collection.text_color ? `${collection.text_color}cc` : "#6B5B52" }}>
              {collection.description}
            </p>
          )}
        </div>

        {isSingleItem ? (
          /* Single Item Layout - Two-zone card: pure image + info panel below */
          <div className="max-w-4xl mx-auto">
            <div className="group rounded-3xl overflow-hidden shadow-xl border border-gray-100/80 bg-white">
              {/* Image zone - full space + zoom */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={heroItem.cookie.image_url || "/placeholder.svg"}
                  alt={heroItem.cookie.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                {(heroItem.custom_tag || heroItem.cookie.badge?.visible) && (
                  <div className="absolute top-4 left-4">
                    <StampBadge
                      text={heroItem.custom_tag || heroItem.cookie.badge?.text || "Del mes"}
                      bgColor={heroItem.cookie.badge?.bg_color}
                      textColor={heroItem.cookie.badge?.text_color}
                      className="!top-0 !right-0"
                    />
                  </div>
                )}
              </div>
              {/* Info panel */}
              <div
                className="px-6 py-5 md:px-10 md:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                style={{ backgroundColor: collection.title_color || '#930021' }}
              >
                <div className="min-w-0">
                  <h3 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight mb-1 truncate">{heroItem.cookie.name}</h3>
                  <p className="text-white/70 text-xs sm:text-sm line-clamp-1">{heroItem.cookie.description}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-2xl md:text-3xl font-bold text-[#F8E19A]">{heroItem.cookie.price.toFixed(2)}€</span>
                  <button
                    onClick={() => setSelectedCookie(heroItem.cookie as any)}
                    className="px-5 py-2.5 rounded-full font-bold text-sm bg-white/95 hover:bg-[#F8E19A] transition-colors shadow"
                    style={{ color: collection.title_color || '#930021' }}
                  >
                    Probar ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid Layout - Two-zone card */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Hero Cookie */}
            <div className="lg:col-span-7">
              <div className="group rounded-3xl overflow-hidden shadow-xl border border-gray-100/80 bg-white">
                {/* Image - full space + zoom */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    src={heroItem.cookie.image_url || "/placeholder.svg"}
                    alt={heroItem.cookie.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  {(heroItem.custom_tag || heroItem.cookie.badge?.visible) && (
                    <div className="absolute top-3 left-3 z-10">
                      <StampBadge
                        text={heroItem.custom_tag || heroItem.cookie.badge?.text || "Del mes"}
                        bgColor={heroItem.cookie.badge?.bg_color}
                        textColor={heroItem.cookie.badge?.text_color}
                        className="!top-0 !right-0"
                      />
                    </div>
                  )}
                </div>
                {/* Info panel */}
                <div
                  className="px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between gap-4"
                  style={{ backgroundColor: collection.title_color || '#930021' }}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">{heroItem.cookie.name}</h3>
                    <p className="text-white/80 text-xs sm:text-sm line-clamp-1 mt-0.5 hidden sm:block">{heroItem.cookie.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xl sm:text-2xl font-bold text-[#F8E19A]">{heroItem.cookie.price.toFixed(2)}€</span>
                    <button
                      onClick={() => setSelectedCookie(heroItem.cookie as any)}
                      className="px-5 py-2 rounded-full font-bold text-xs sm:text-sm bg-white hover:bg-[#F8E19A] transition-all transform hover:scale-105 active:scale-95 shadow-md whitespace-nowrap"
                      style={{ color: collection.title_color || '#930021' }}
                    >
                      Probar ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Grid */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {otherItems.map((item) => (
                <div
                  key={item.cookie.id}
                  onClick={() => setSelectedCookie(item.cookie as any)}
                  className="group cursor-pointer flex gap-4 items-center bg-white/70 backdrop-blur-sm border border-white hover:border-[#930021]/30 rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                    <img
                      src={item.cookie.image_url || "/placeholder.svg"}
                      alt={item.cookie.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {item.custom_tag && (
                      <div className="absolute top-1 left-1">
                        <span className="text-[9px] font-bold uppercase leading-none tracking-wide text-white bg-[#930021] px-1.5 py-0.5 rounded-md">
                          {item.custom_tag}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base text-gray-900 group-hover:text-[#930021] transition-colors truncate">
                      {item.cookie.name}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 mb-2 leading-relaxed">{item.cookie.description}</p>
                    <span className="text-sm font-bold text-[#924c14]">{item.cookie.price.toFixed(2)}€</span>
                  </div>
                </div>
              ))}

              <Link
                href="/galletas"
                className="flex items-center justify-center gap-2 py-3 px-6 rounded-full text-white font-medium transition-all duration-200 group mt-2 hover:opacity-90 shadow-md"
                style={{ backgroundColor: collection.title_color || '#930021' }}
              >
                Ver toda la colección
                {/* <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> */}
              </Link>
            </div>
          </div>
        )}
      </div>

      {selectedCookie && (
        <CookieDetailModal
          cookie={selectedCookie}
          onClose={() => setSelectedCookie(null)}
        />
      )}
    </section>
  )
}
