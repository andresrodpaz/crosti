"use client"

// ─── CookieSkeletonCard ───────────────────────────────────────────────────────
// Reusable skeleton/shimmer placeholder for cookie cards.
// Variants:
//   "catalog"       — square image + title + price + button (galletas, tienda, carousel section)
//   "monthly-hero"  — wide landscape card (MonthlyCookiesSection hero)
//   "monthly-side"  — horizontal thumbnail + text rows (MonthlyCookiesSection side list)

export type SkeletonVariant = "catalog" | "monthly-hero" | "monthly-side" | "box"

interface CookieSkeletonCardProps {
  variant?: SkeletonVariant
}

export function CookieSkeletonCard({ variant = "catalog" }: CookieSkeletonCardProps) {
  if (variant === "box") {
    return (
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
        {/* Image area 4/3 */}
        <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skeleton-shimmer" />
          {/* Price badge top-right */}
          <div className="absolute top-3 right-3 h-7 w-20 bg-gray-300/70 rounded-full" />
        </div>
        {/* Card body */}
        <div className="p-5 space-y-3">
          {/* Title */}
          <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
          {/* Description */}
          <div className="h-3 bg-gray-200 rounded-md w-full" />
          <div className="h-3 bg-gray-200 rounded-md w-4/5" />
          {/* Cookie tags strip */}
          <div className="pt-1">
            <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
            <div className="flex flex-wrap gap-1">
              <div className="h-6 w-24 bg-[#F8E19A]/50 rounded-full" />
              <div className="h-6 w-20 bg-[#F8E19A]/50 rounded-full" />
              <div className="h-6 w-16 bg-[#F8E19A]/50 rounded-full" />
            </div>
          </div>
          {/* Button */}
          <div className="h-10 bg-[#930021]/10 rounded-lg w-full" />
        </div>
      </div>
    )
  }

  if (variant === "monthly-hero") {
    return (
      <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gray-200 animate-pulse">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-shimmer" />
        {/* Bottom overlay bar like the real card */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 space-y-3">
          <div className="h-5 w-24 bg-white/30 rounded-lg" />
          <div className="h-8 w-2/3 bg-white/30 rounded-xl" />
          <div className="h-4 w-full bg-white/20 rounded-lg" />
          <div className="h-4 w-4/5 bg-white/20 rounded-lg" />
          <div className="flex items-center gap-4 pt-2">
            <div className="h-8 w-20 bg-white/30 rounded-lg" />
            <div className="h-10 w-32 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (variant === "monthly-side") {
    return (
      <div className="bg-white p-4 rounded-2xl flex gap-5 items-center animate-pulse">
        {/* Thumbnail */}
        <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
        {/* Text */}
        <div className="flex-1 space-y-2">
          <div className="h-3 w-16 bg-gray-200 rounded-md" />
          <div className="h-5 w-3/4 bg-gray-200 rounded-lg" />
          <div className="h-3 w-full bg-gray-200 rounded-md" />
          <div className="h-3 w-2/3 bg-gray-200 rounded-md" />
          <div className="flex items-center justify-between pt-1">
            <div className="h-4 w-12 bg-gray-200 rounded-md" />
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  // "catalog" variant (default)
  return (
    <div className="rounded-3xl overflow-hidden shadow-sm animate-pulse">
      {/* Image placeholder */}
      <div className="bg-gray-200 aspect-square relative overflow-hidden rounded-t-3xl">
        {/* Shimmer sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skeleton-shimmer" />
        {/* Tag placeholders */}
        <div className="absolute top-3 left-3 flex gap-1">
          <div className="h-5 w-14 bg-gray-300/60 rounded-full" />
        </div>
      </div>
      {/* Card bottom (yellow-tinted like real cards) */}
      <div className="bg-[#F5DFA0]/70 p-6 rounded-b-3xl space-y-3">
        {/* Title */}
        <div className="h-4 bg-[#930021]/20 rounded-full w-3/4 mx-auto" />
        {/* Price */}
        <div className="h-6 bg-[#930021]/20 rounded-full w-1/3 mx-auto" />
        {/* Button */}
        <div className="h-11 bg-[#930021]/10 rounded-full w-full" />
      </div>
    </div>
  )
}

// ─── CookieSkeletonGrid ───────────────────────────────────────────────────────
// Renders N skeleton cards in the same grid layout as the real cookie grids.

interface CookieSkeletonGridProps {
  count?: number
  variant?: SkeletonVariant
  /** Tailwind grid class override. Defaults depend on variant. */
  gridClass?: string
}

export function CookieSkeletonGrid({
  count = 3,
  variant = "catalog",
  gridClass,
}: CookieSkeletonGridProps) {
  const defaultGrid =
    variant === "catalog"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      : variant === "monthly-side"
      ? "space-y-6"
      : "grid grid-cols-1 gap-6"

  return (
    <div className={gridClass ?? defaultGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <CookieSkeletonCard key={i} variant={variant} />
      ))}
    </div>
  )
}
