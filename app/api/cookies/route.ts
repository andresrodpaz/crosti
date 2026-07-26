import { createPublicClient } from "@/lib/supabase/public"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const carouselOnly = searchParams.get("carousel") === "true"
  const visibleOnly = searchParams.get("visible") === "true"
  const includeAll = searchParams.get("all") === "true"

  try {
    const supabase = createPublicClient()

    // ── 1. Fetch cookies (simple, fast query) ─────────────────────
    let cookieQuery = supabase.from("cookies").select("*")

    if (carouselOnly) {
      cookieQuery = cookieQuery
        .eq("in_carousel", true)
        .order("carousel_order", { ascending: true })
        .limit(8)
    } else if (visibleOnly || !includeAll) {
      cookieQuery = cookieQuery.eq("is_visible", true).order("name")
    } else {
      cookieQuery = cookieQuery.order("name")
    }

    // ── 2. Fetch tag map in parallel (simple join, fast) ──────────
    const [{ data: cookiesData, error: cookiesError }, { data: tagData, error: tagError }] =
      await Promise.all([
        cookieQuery,
        supabase
          .from("cookie_tags")
          .select("cookie_id, tags ( id, name, colors ( hex ) )"),
      ])

    if (cookiesError) {
      console.error("[Message] Database error fetching cookies:", cookiesError)
      return NextResponse.json(
        { error: cookiesError.message, cookies: [] },
        { status: 500 }
      )
    }

    if (tagError) {
      console.warn("[Message] Database warning fetching cookie tags:", tagError)
    }

    // Build a fast lookup: cookie_id → tags[]
    const tagsByCookieId: Record<string, { id: string; name: string; color_hex: string }[]> = {}
    for (const row of tagData ?? []) {
      const tag = row.tags as any
      if (!tag?.id) continue
      if (!tagsByCookieId[row.cookie_id]) tagsByCookieId[row.cookie_id] = []
      tagsByCookieId[row.cookie_id].push({
        id: tag.id,
        name: tag.name,
        color_hex: tag.colors?.hex ?? "#6b7280",
      })
    }

    const formattedCookies = (cookiesData ?? []).map((cookie) => {
      const rawUrls = Array.isArray(cookie.image_urls) ? cookie.image_urls : []
      const imageUrls = rawUrls.map((url: string) =>
        typeof url === "string" && url.startsWith("data:image")
          ? (cookie.image_url && !cookie.image_url.startsWith("data:image")
              ? cookie.image_url
              : "/stack-of-delicious-chocolate-chip-cookies-on-white.jpg")
          : url
      )

      return {
        ...cookie,
        image_urls: imageUrls,
        main_image_index: cookie.main_image_index || 0,
        tags: tagsByCookieId[cookie.id] ?? [],
        featured_description: cookie.featured_description || "",
      }
    })

    return NextResponse.json(formattedCookies, {
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    })
  } catch (error) {
    console.error("[Message] Unexpected error in cookies API:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
