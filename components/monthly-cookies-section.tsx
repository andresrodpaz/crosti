"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import { CookieSkeletonCard, CookieSkeletonGrid } from "@/components/ui/cookie-skeleton"

interface CollectionItem {
  cookie: {
    id: string
    name: string
    description: string
    price: number
    image_url: string
    tags: { name: string; color_hex: string }[]
  }
  is_hero: boolean
  custom_tag?: string
}

interface MonthlyCollection {
  title: string
  subtitle: string
  description?: string
  bg_color: string
  items: CollectionItem[]
}

import { CookieDetailModal, type CookieItem } from "@/components/cookie-detail-modal"

export function MonthlyCookiesSection() {
  const [collection, setCollection] = useState<MonthlyCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCookie, setSelectedCookie] = useState<CookieItem | null>(null)

  useEffect(() => {
    async function loadActiveCollection() {
      try {
        const supabase = createClient()
        
        // 1. Get active collection
        const { data: collectionData, error } = await supabase
          .from("monthly_collections")
          .select("*")
          .eq("status", "active")
          .single()

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
              image_url
            )
          `)
          .eq("collection_id", collectionData.id)
          .order("display_order")

        if (itemsData) {
           // Fetch tags for these cookies
           const cookieIds = itemsData.map((i: any) => i.cookie.id)
           const { data: tagsData } = await supabase
            .from("cookie_tags")
            .select("cookie_id, tags(name, color_id)")
             .in("cookie_id", cookieIds)

             // Need to fetch color hexes too if they are separate, but let's assume simple tag join for now or ignore colors if complex
             // Actually existing code uses a separate colors table. Let's simplify and just show names or skip tags for now to avoid complex joins in client
             // OR better: fetch tags properly. 
             
            // Map items
            const items: CollectionItem[] = itemsData.map((item: any) => ({
              is_hero: item.is_hero,
              custom_tag: item.custom_tag,
              cookie: {
                id: item.cookie.id,
                name: item.cookie.name,
                description: item.cookie.description,
                price: item.cookie.price,
                image_url: Array.isArray(item.cookie.image_urls) 
                  ? item.cookie.image_urls[0] 
                  : (JSON.parse(item.cookie.image_urls as unknown as string)?.[0] || item.cookie.image_url || ""),
                tags: [] // Simplified for this view
              }
            }))

            setCollection({
              title: collectionData.title,
              subtitle: collectionData.subtitle,
              description: collectionData.description,
              bg_color: collectionData.bg_color || "#FEFCF5",
              items
            })
        }
      } catch (err) {
        console.error("Error loading monthly collection", err)
      } finally {
        setLoading(false)
      }
    }

    loadActiveCollection()
  }, [])

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
          <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-[#930021] mb-6">
            {collection.title}
          </h2>
          <p className="text-xl md:text-2xl text-[#924c14] font-medium max-w-2xl mx-auto mb-4">
            {collection.subtitle}
          </p>
          {collection.description && (
             <p className="text-lg text-[#6B5B52] max-w-3xl mx-auto leading-relaxed">
               {collection.description}
             </p>
          )}
        </div>

        {isSingleItem ? (
          /* Single Item Layout - Centered & Featured */
          <div className="max-w-4xl mx-auto">
             <div className="relative group rounded-4xl overflow-hidden shadow-2xl aspect-[16/10]">
                <img
                  src={heroItem.cookie.image_url || "/placeholder.svg"}
                  alt={heroItem.cookie.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-95"></div>
                
                <div className="absolute bottom-0 left-0 p-8 md:p-16 text-white w-full">
                  {/* mobile stacking: text then price/button */}
                  <div className="flex flex-col gap-6 md:hidden">
                    <div className="max-w-2xl">
                      {heroItem.custom_tag && (
                        <span className="inline-block px-4 py-1.5 bg-[#930021] text-[#F8E19A] text-xs font-bold uppercase tracking-widest rounded-full mb-4 shadow-lg">
                          {heroItem.custom_tag}
                        </span>
                      )}
                      <h3 className="font-sans text-4xl md:text-6xl font-bold mb-4 leading-tight">{heroItem.cookie.name}</h3>
                      <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-6 line-clamp-3 md:line-clamp-none">
                        {heroItem.cookie.description}
                      </p>
                      <span className="text-3xl font-bold text-[#F8E19A] mb-4">{heroItem.cookie.price.toFixed(2)}€</span>
                      <button 
                        onClick={() => setSelectedCookie(heroItem.cookie as any)}
                        className="w-full px-8 py-3 bg-white text-[#930021] rounded-full font-bold text-lg hover:bg-[#F9E7AE] transition-all transform hover:scale-105 shadow-xl"
                      >
                        Probar ahora
                      </button>
                    </div>
                  </div>
                  {/* desktop layout */}
                  <div className="hidden md:flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div className="max-w-2xl">
                      {heroItem.custom_tag && (
                        <span className="inline-block px-4 py-1.5 bg-[#930021] text-[#F8E19A] text-xs font-bold uppercase tracking-widest rounded-full mb-4 shadow-lg">
                          {heroItem.custom_tag}
                        </span>
                      )}
                      <h3 className="font-sans text-4xl md:text-6xl font-bold mb-4 leading-tight">{heroItem.cookie.name}</h3>
                      <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-6 line-clamp-3 md:line-clamp-none">
                        {heroItem.cookie.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-4 min-w-max">
                      <span className="text-3xl md:text-5xl font-bold text-[#F8E19A]">{heroItem.cookie.price.toFixed(2)}€</span>
                      <button 
                        onClick={() => setSelectedCookie(heroItem.cookie as any)}
                        className="px-8 py-3 bg-white text-[#930021] rounded-full font-bold text-lg hover:bg-[#F9E7AE] transition-all transform hover:scale-105 shadow-xl"
                      >
                        Probar ahora
                      </button>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        ) : (
          /* Grid Layout (Original) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Cookie */}
            <div className="lg:col-span-7 relative group">
              <div className="relative aspect-4/3 rounded-4xl overflow-hidden shadow-2xl">
                <img
                  src={heroItem.cookie.image_url || "/placeholder.svg"}
                  alt={heroItem.cookie.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>

                <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                  {heroItem.custom_tag && (
                    <span className="inline-block px-3 py-1 bg-[#930021] text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-3 shadow-lg">
                      {heroItem.custom_tag}
                    </span>
                  )}
                  <h3 className="text-3xl md:text-4xl font-bold mb-3">{heroItem.cookie.name}</h3>
                  <p className="text-white/90 mb-6 text-lg max-w-md line-clamp-2">
                    {heroItem.cookie.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-[#F9E7AE]">{heroItem.cookie.price.toFixed(2)}€</span>
                    <button 
                      onClick={() => setSelectedCookie(heroItem.cookie as any)}
                      className="px-6 py-2 bg-white text-[#930021] rounded-full font-medium hover:bg-[#F9E7AE] transition-colors"
                    >
                      Probar ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Grid */}
            <div className="lg:col-span-5 space-y-6">
              {otherItems.map((item) => (
                <div 
                  key={item.cookie.id} 
                  onClick={() => setSelectedCookie(item.cookie as any)}
                  className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex gap-5 items-center group cursor-pointer border border-transparent hover:border-[#930021]/20"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.cookie.image_url || "/placeholder.svg"}
                      alt={item.cookie.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1">
                    {item.custom_tag && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#930021] bg-[#930021]/10 px-2 py-0.5 rounded-md mb-1 inline-block">
                        {item.custom_tag}
                      </span>
                    )}
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#930021] transition-colors line-clamp-1">
                      {item.cookie.name}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.cookie.description}</p>
                    <div className="flex items-center justify-between">
                       <span className="font-bold text-[#924c14]">{item.cookie.price.toFixed(2)}€</span>
                       <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#930021] group-hover:text-white transition-colors">
                           <ArrowRight className="w-4 h-4" />
                       </span>
                    </div>
                  </div>
                </div>
              ))}

              <Link href="/galletas" className="block w-full py-4 text-center text-gray-500 hover:text-[#930021] font-medium transition-colors border-t border-gray-200 mt-4 group">
                <span className="inline-flex items-center gap-2">
                  Ver toda la colección <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
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
