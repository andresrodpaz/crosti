"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"

interface Banner {
  id: string
  title: string
  subtitle: string | null
  link_url: string | null
  link_text: string | null
  background_color: string
  text_color: string
}

export function NewsBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBanners()
  }, [])

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [banners.length])

  async function loadBanners() {
    try {
      const res = await fetch("/api/banners")
      if (res.ok) {
        const data = await res.json()
        setBanners(data)
      }
    } catch (error) {
      console.error("[Message] Error loading banners:", error)
    }
    setIsLoading(false)
  }

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
  }

  const visibleBanners = banners.filter((b) => !dismissed.has(b.id))

  if (isLoading || visibleBanners.length === 0) {
    return null
  }

  const currentBanner = visibleBanners[currentIndex % visibleBanners.length]

  if (!currentBanner) return null

  return (
    <div
      className="relative overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: currentBanner.background_color,
        color: currentBanner.text_color,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-4">
          <Sparkles className="w-4 h-4 flex-shrink-0 animate-pulse" />

          <div className="flex items-center gap-3 text-center">
            <span className="font-semibold text-sm md:text-base">{currentBanner.title}</span>
            {currentBanner.subtitle && (
              <span className="hidden sm:inline text-sm opacity-90">- {currentBanner.subtitle}</span>
            )}
          </div>

          {currentBanner.link_url && (
            <Link
              href={currentBanner.link_url}
              className="hidden sm:flex items-center gap-1 text-sm font-medium hover:underline underline-offset-4 flex-shrink-0"
            >
              {currentBanner.link_text || "Ver más"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}

          <button
            onClick={() => handleDismiss(currentBanner.id)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {visibleBanners.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {visibleBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex % visibleBanners.length ? "bg-current w-4" : "bg-current/40"
                }`}
                aria-label={`Ir al banner ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
